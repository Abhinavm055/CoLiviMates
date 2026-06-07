const express = require('express');
const router = express.Router();
const {
  createRoommateRequest,
  getAllRoommateRequests,
  getRoommateRequestById,
  updateRoommateRequest,
  deleteRoommateRequest
} = require('../controllers/roommateRequestController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', getAllRoommateRequests);
router.get('/:id', getRoommateRequestById);

// Protected routes (any authenticated user can create)
router.post('/', authenticateToken, createRoommateRequest);

// Protected routes (ownership verified inside controller)
router.put('/:id', authenticateToken, updateRoommateRequest);
router.delete('/:id', authenticateToken, deleteRoommateRequest);

module.exports = router;
