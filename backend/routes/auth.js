const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, verifyUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private/Protected routes
router.get('/me', authenticateToken, getMe);

// Admin-only user management routes
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/verify', authenticateToken, authorizeRoles('admin'), verifyUser);

module.exports = router;
