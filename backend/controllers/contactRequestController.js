const pool = require('../config/db');

// @desc    Create a new contact request
// @route   POST /api/contact-requests
// @access  Private
const createContactRequest = async (req, res) => {
  const { listing_id, listingId, message } = req.body;
  const activeListingId = listingId !== undefined ? listingId : listing_id;

  // 1. Validation
  if (!activeListingId) {
    return res.status(400).json({ error: 'Listing ID is required.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    // 2. Check if listing exists and get owner_id
    const listingResult = await pool.query('SELECT owner_id FROM listings WHERE id = $1', [activeListingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const { owner_id } = listingResult.rows[0];

    // 3. Prevent self-inquiry
    if (owner_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot send a contact request for your own listing.' });
    }

    // 4. Insert contact request
    const insertResult = await pool.query(
      `INSERT INTO contact_requests (listing_id, owner_id, tenant_id, message, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [activeListingId, owner_id, req.user.id, message.trim(), 'pending']
    );

    return res.status(201).json({
      message: 'Contact request sent successfully.',
      contactRequest: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Error in createContactRequest:', error.message);
    return res.status(500).json({ error: 'Internal server error while sending contact request.' });
  }
};

// @desc    Get contact requests for owner
// @route   GET /api/contact-requests/owner
// @access  Private (Owner/Admin only)
const getOwnerContactRequests = async (req, res) => {
  try {
    // Query contact requests where the user is the owner, joining tenant details and listing title
    const result = await pool.query(
      `SELECT cr.id, cr.listing_id, cr.owner_id, cr.tenant_id, cr.message, cr.status, cr.created_at,
              u.name AS tenant_name,
              u.email AS tenant_email,
              l.title AS listing_title
       FROM contact_requests cr
       JOIN users u ON cr.tenant_id = u.id
       JOIN listings l ON cr.listing_id = l.id
       WHERE cr.owner_id = $1
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      contactRequests: result.rows
    });
  } catch (error) {
    console.error('Error in getOwnerContactRequests:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching contact requests.' });
  }
};

// @desc    Get contact requests created by the tenant
// @route   GET /api/contact-requests/tenant
// @access  Private
const getTenantContactRequests = async (req, res) => {
  try {
    // Query contact requests sent by this tenant, joining owner details and listing title
    const result = await pool.query(
      `SELECT cr.id, cr.listing_id, cr.owner_id, cr.tenant_id, cr.message, cr.status, cr.created_at,
              u.name AS owner_name,
              u.email AS owner_email,
              l.title AS listing_title
       FROM contact_requests cr
       JOIN users u ON cr.owner_id = u.id
       JOIN listings l ON cr.listing_id = l.id
       WHERE cr.tenant_id = $1
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      contactRequests: result.rows
    });
  } catch (error) {
    console.error('Error in getTenantContactRequests:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching tenant contact requests.' });
  }
};

// @desc    Update contact request status
// @route   PUT /api/contact-requests/:id/status
// @access  Private (Owner/Admin only)
const updateContactRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['pending', 'accepted', 'rejected'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}` });
  }

  try {
    // 1. Check if request exists
    const checkResult = await pool.query('SELECT owner_id FROM contact_requests WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact request not found.' });
    }

    const { owner_id } = checkResult.rows[0];

    // 2. Authorization check (only request owner or admin can update status)
    if (owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this contact request.' });
    }

    // 3. Update status
    const updateResult = await pool.query(
      `UPDATE contact_requests 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    // Fetch complete request data with tenant and listing details to return
    const completeResult = await pool.query(
      `SELECT cr.id, cr.listing_id, cr.owner_id, cr.tenant_id, cr.message, cr.status, cr.created_at,
              u.name AS tenant_name,
              u.email AS tenant_email,
              l.title AS listing_title
       FROM contact_requests cr
       JOIN users u ON cr.tenant_id = u.id
       JOIN listings l ON cr.listing_id = l.id
       WHERE cr.id = $1`,
      [updateResult.rows[0].id]
    );

    return res.status(200).json({
      message: 'Contact request status updated successfully.',
      contactRequest: completeResult.rows[0]
    });
  } catch (error) {
    console.error('Error in updateContactRequestStatus:', error.message);
    return res.status(500).json({ error: 'Internal server error while updating status.' });
  }
};

module.exports = {
  createContactRequest,
  getOwnerContactRequests,
  getTenantContactRequests,
  updateContactRequestStatus
};
