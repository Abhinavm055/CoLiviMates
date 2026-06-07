const pool = require('../config/db');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Owner/Admin only)
const createListing = async (req, res) => {
  const {
    title,
    description,
    rent,
    location,
    city,
    sharing_type,
    facilities,
    images,
    available_from
  } = req.body;

  // 1. Validation
  if (!title || !location || !city) {
    return res.status(400).json({ error: 'Title, location, and city are required fields.' });
  }

  if (rent === undefined || rent === null || parseInt(rent) <= 0) {
    return res.status(400).json({ error: 'Rent is required and must be a positive integer.' });
  }

  // 2. Default values for array fields
  const facilitiesArray = Array.isArray(facilities) ? facilities : [];
  const imagesArray = Array.isArray(images) ? images : [];
  const availableFromDate = available_from ? new Date(available_from) : new Date();

  try {
    // 3. Insert listing into database
    const insertResult = await pool.query(
      `INSERT INTO listings 
       (title, description, rent, location, city, sharing_type, facilities, images, owner_id, available_from) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        title,
        description || '',
        parseInt(rent),
        location,
        city,
        sharing_type || 'double',
        facilitiesArray,
        imagesArray,
        req.user.id, // Populated from authenticateToken middleware
        availableFromDate
      ]
    );

    const newListing = insertResult.rows[0];

    // 4. Fetch the listing with owner's name
    const fullListingResult = await pool.query(
      `SELECT l.*, u.name AS owner_name 
       FROM listings l 
       JOIN users u ON l.owner_id = u.id 
       WHERE l.id = $1`,
      [newListing.id]
    );

    return res.status(201).json({
      message: 'Listing created successfully',
      listing: fullListingResult.rows[0]
    });
  } catch (error) {
    console.error('Error in createListing:', error.message);
    return res.status(500).json({ error: 'Internal server error while creating listing.' });
  }
};

// @desc    Get all listings (with pagination and filters)
// @route   GET /api/listings
// @access  Public
const getAllListings = async (req, res) => {
  const { page = 1, limit = 10, city, minRent, maxRent, sharingType } = req.query;

  try {
    const clauses = [];
    const params = [];
    let paramIndex = 1;

    // 1. Build dynamic search clauses
    if (city) {
      clauses.push(`l.city ILIKE $${paramIndex}`);
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (minRent !== undefined && minRent !== '') {
      clauses.push(`l.rent >= $${paramIndex}`);
      params.push(parseInt(minRent));
      paramIndex++;
    }

    if (maxRent !== undefined && maxRent !== '') {
      clauses.push(`l.rent <= $${paramIndex}`);
      params.push(parseInt(maxRent));
      paramIndex++;
    }

    if (sharingType) {
      clauses.push(`l.sharing_type = $${paramIndex}`);
      params.push(sharingType);
      paramIndex++;
    }

    // 2. Count total matches for pagination
    let countQuery = 'SELECT COUNT(*) FROM listings l';
    if (clauses.length > 0) {
      countQuery += ' WHERE ' + clauses.join(' AND ');
    }

    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // 3. Fetch paginated data
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let selectQuery = `
      SELECT l.*, u.name AS owner_name 
      FROM listings l 
      JOIN users u ON l.owner_id = u.id
    `;

    if (clauses.length > 0) {
      selectQuery += ' WHERE ' + clauses.join(' AND ');
    }

    selectQuery += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum);
    params.push(offset);

    const listingsResult = await pool.query(selectQuery, params);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      },
      listings: listingsResult.rows
    });
  } catch (error) {
    console.error('Error in getAllListings:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching listings.' });
  }
};

// @desc    Get a single listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT l.*, u.name AS owner_name 
       FROM listings l 
       JOIN users u ON l.owner_id = u.id 
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    return res.status(200).json({ listing: result.rows[0] });
  } catch (error) {
    console.error('Error in getListingById:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching listing details.' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (Owner/Admin only)
const updateListing = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    rent,
    location,
    city,
    sharing_type,
    facilities,
    images,
    status,
    verified,
    available_from
  } = req.body;

  try {
    // 1. Check if listing exists and verify owner
    const listingCheck = await pool.query('SELECT owner_id FROM listings WHERE id = $1', [id]);
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const listing = listingCheck.rows[0];

    // Ownership or Admin check
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this listing.' });
    }

    // 2. Validate update fields if present
    if (title !== undefined && !title) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    if (rent !== undefined && (rent === null || parseInt(rent) <= 0)) {
      return res.status(400).json({ error: 'Rent must be a positive integer.' });
    }

    if (location !== undefined && !location) {
      return res.status(400).json({ error: 'Location cannot be empty.' });
    }

    if (city !== undefined && !city) {
      return res.status(400).json({ error: 'City cannot be empty.' });
    }

    // 3. Dynamically build update fields
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = {
      title,
      description,
      rent: rent !== undefined ? parseInt(rent) : undefined,
      location,
      city,
      sharing_type,
      facilities,
      images,
      status,
      verified,
      available_from: available_from ? new Date(available_from) : undefined
    };

    for (const [key, val] of Object.entries(allowedFields)) {
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
      UPDATE listings 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, params);
    
    // Fetch with owner name
    const fullResult = await pool.query(
      `SELECT l.*, u.name AS owner_name 
       FROM listings l 
       JOIN users u ON l.owner_id = u.id 
       WHERE l.id = $1`,
      [updateResult.rows[0].id]
    );

    return res.status(200).json({
      message: 'Listing updated successfully',
      listing: fullResult.rows[0]
    });
  } catch (error) {
    console.error('Error in updateListing:', error.message);
    return res.status(500).json({ error: 'Internal server error while updating listing.' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner/Admin only)
const deleteListing = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Check if listing exists and verify owner
    const listingCheck = await pool.query('SELECT owner_id FROM listings WHERE id = $1', [id]);
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const listing = listingCheck.rows[0];

    // Ownership or Admin check
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this listing.' });
    }

    // 2. Delete the listing
    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error in deleteListing:', error.message);
    return res.status(500).json({ error: 'Internal server error while deleting listing.' });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing
};
