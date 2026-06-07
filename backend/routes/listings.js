const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing
} = require('../controllers/listingController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);

// Protected routes (Create: restricted to Owner and Admin)
router.post('/', authenticateToken, authorizeRoles('owner', 'admin'), createListing);

// Protected routes (Update/Delete: ownership verified inside controller)
router.put('/:id', authenticateToken, updateListing);
router.delete('/:id', authenticateToken, deleteListing);

module.exports = router;
