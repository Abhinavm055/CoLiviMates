const express = require('express');
const router = express.Router();
const {
  createContactRequest,
  getOwnerContactRequests,
  getTenantContactRequests,
  updateContactRequestStatus
} = require('../controllers/contactRequestController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// POST /api/contact-requests - Create a new request (Authenticated users)
router.post('/', authenticateToken, createContactRequest);

// GET /api/contact-requests/owner - Get incoming contact requests (Owners & Admins only)
router.get('/owner', authenticateToken, authorizeRoles('owner', 'admin'), getOwnerContactRequests);

// GET /api/contact-requests/tenant - Get outgoing contact requests (Authenticated users)
router.get('/tenant', authenticateToken, getTenantContactRequests);

// PUT /api/contact-requests/:id/status - Update request status (Owners & Admins only)
router.put('/:id/status', authenticateToken, updateContactRequestStatus);

module.exports = router;
