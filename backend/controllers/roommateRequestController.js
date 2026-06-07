const pool = require('../config/db');

// @desc    Create a new roommate request
// @route   POST /api/roommate-requests
// @access  Private
const createRoommateRequest = async (req, res) => {
  const { title, description, budget, preferred_location, sharing_type } = req.body;

  // 1. Validation
  if (!title || !preferred_location) {
    return res.status(400).json({ error: 'Title and preferred location are required fields.' });
  }

  if (budget === undefined || budget === null || parseInt(budget) <= 0) {
    return res.status(400).json({ error: 'Budget is required and must be a positive integer.' });
  }

  try {
    // 2. Insert into database
    const insertResult = await pool.query(
      `INSERT INTO roommate_requests 
       (title, description, budget, preferred_location, sharing_type, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        title,
        description || '',
        parseInt(budget),
        preferred_location,
        sharing_type || 'double',
        req.user.id // From authenticateToken middleware
      ]
    );

    const newRequest = insertResult.rows[0];

    // 3. Fetch user name joined
    const fullResult = await pool.query(
      `SELECT r.*, u.name AS user_name 
       FROM roommate_requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = $1`,
      [newRequest.id]
    );

    return res.status(201).json({
      message: 'Roommate request created successfully',
      roommateRequest: fullResult.rows[0]
    });
  } catch (error) {
    console.error('Error in createRoommateRequest:', error.message);
    return res.status(500).json({ error: 'Internal server error while creating roommate request.' });
  }
};

// @desc    Get all roommate requests (with pagination and filters)
// @route   GET /api/roommate-requests
// @access  Public
const getAllRoommateRequests = async (req, res) => {
  const { page = 1, limit = 10, city, minBudget, maxBudget, sharingType } = req.query;

  try {
    const clauses = [];
    const params = [];
    let paramIndex = 1;

    // 1. Build dynamic clauses
    // Search by city checks if preferred_location matches city name case-insensitively
    if (city) {
      clauses.push(`r.preferred_location ILIKE $${paramIndex}`);
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (minBudget !== undefined && minBudget !== '') {
      clauses.push(`r.budget >= $${paramIndex}`);
      params.push(parseInt(minBudget));
      paramIndex++;
    }

    if (maxBudget !== undefined && maxBudget !== '') {
      clauses.push(`r.budget <= $${paramIndex}`);
      params.push(parseInt(maxBudget));
      paramIndex++;
    }

    if (sharingType) {
      clauses.push(`r.sharing_type = $${paramIndex}`);
      params.push(sharingType);
      paramIndex++;
    }

    // 2. Count matches
    let countQuery = 'SELECT COUNT(*) FROM roommate_requests r';
    if (clauses.length > 0) {
      countQuery += ' WHERE ' + clauses.join(' AND ');
    }

    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // 3. Fetch paginated records
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let selectQuery = `
      SELECT r.*, u.name AS user_name 
      FROM roommate_requests r 
      JOIN users u ON r.user_id = u.id
    `;

    if (clauses.length > 0) {
      selectQuery += ' WHERE ' + clauses.join(' AND ');
    }

    selectQuery += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum);
    params.push(offset);

    const result = await pool.query(selectQuery, params);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      },
      roommateRequests: result.rows
    });
  } catch (error) {
    console.error('Error in getAllRoommateRequests:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching roommate requests.' });
  }
};

// @desc    Get a single roommate request by ID
// @route   GET /api/roommate-requests/:id
// @access  Public
const getRoommateRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name 
       FROM roommate_requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Roommate request not found.' });
    }

    return res.status(200).json({ roommateRequest: result.rows[0] });
  } catch (error) {
    console.error('Error in getRoommateRequestById:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching roommate request.' });
  }
};

// @desc    Update a roommate request
// @route   PUT /api/roommate-requests/:id
// @access  Private
const updateRoommateRequest = async (req, res) => {
  const { id } = req.params;
  const { title, description, budget, preferred_location, sharing_type, status } = req.body;

  try {
    // 1. Check if request exists
    const requestCheck = await pool.query('SELECT user_id FROM roommate_requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Roommate request not found.' });
    }

    const roommateRequest = requestCheck.rows[0];

    // Ownership check (Creator or Admin)
    if (roommateRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this roommate request.' });
    }

    // 2. Validate update values
    if (title !== undefined && !title) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    if (budget !== undefined && (budget === null || parseInt(budget) <= 0)) {
      return res.status(400).json({ error: 'Budget must be a positive integer.' });
    }

    if (preferred_location !== undefined && !preferred_location) {
      return res.status(400).json({ error: 'Preferred location cannot be empty.' });
    }

    // 3. Build query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const fields = {
      title,
      description,
      budget: budget !== undefined ? parseInt(budget) : undefined,
      preferred_location,
      sharing_type,
      status
    };

    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(val);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one field to update.' });
    }

    params.push(id);
    const updateQuery = `
      UPDATE roommate_requests 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, params);

    // Fetch user name joined
    const fullResult = await pool.query(
      `SELECT r.*, u.name AS user_name 
       FROM roommate_requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = $1`,
      [updateResult.rows[0].id]
    );

    return res.status(200).json({
      message: 'Roommate request updated successfully',
      roommateRequest: fullResult.rows[0]
    });
  } catch (error) {
    console.error('Error in updateRoommateRequest:', error.message);
    return res.status(500).json({ error: 'Internal server error while updating roommate request.' });
  }
};

// @desc    Delete a roommate request
// @route   DELETE /api/roommate-requests/:id
// @access  Private
const deleteRoommateRequest = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Check if request exists
    const requestCheck = await pool.query('SELECT user_id FROM roommate_requests WHERE id = $1', [id]);
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Roommate request not found.' });
    }

    const roommateRequest = requestCheck.rows[0];

    // Ownership check (Creator or Admin)
    if (roommateRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this roommate request.' });
    }

    // 2. Delete request
    await pool.query('DELETE FROM roommate_requests WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Roommate request deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRoommateRequest:', error.message);
    return res.status(500).json({ error: 'Internal server error while deleting roommate request.' });
  }
};

module.exports = {
  createRoommateRequest,
  getAllRoommateRequests,
  getRoommateRequestById,
  updateRoommateRequest,
  deleteRoommateRequest
};
