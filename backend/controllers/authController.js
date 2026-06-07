const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  console.log('Register endpoint called. Request body received by backend:', req.body);
  const { name, email, password, role } = req.body;

  // 1. Validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  // 2. Validate email format (simple regex check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // 3. Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // 4. Validate role if provided
  const validRoles = ['tenant', 'owner', 'admin'];
  const userRole = role ? role.toLowerCase() : 'tenant';
  if (role && !validRoles.includes(userRole)) {
    return res.status(400).json({ error: `Invalid role. Allowed roles are: ${validRoles.join(', ')}` });
  }

  try {
    // 5. Check if user already exists
    const userExistCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExistCheck.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // 6. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 7. Insert new user into database
    const newUserResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, verified, created_at',
      [name, email.toLowerCase(), passwordHash, userRole]
    );

    const user = newUserResult.rows[0];

    // 8. Generate JWT token
    const token = generateToken(user);

    // 9. Respond with user info and token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Error in register controller. Full Stack Trace:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate inputs
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    // 2. Fetch user from database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate JWT token
    const token = generateToken(user);

    // 5. Respond with user info and token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Error in login controller:', error.message);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const userId = req.user.id;

    // Fetch user details from database
    const userResult = await pool.query(
      'SELECT id, name, email, role, verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in getMe controller:', error.message);
    return res.status(500).json({ error: 'Internal server error fetching user profile.' });
  }
};

// @desc    Get all registered users
// @route   GET /api/auth/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, verified, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error('Error in getAllUsers controller:', error.message);
    return res.status(500).json({ error: 'Internal server error fetching all users.' });
  }
};

// @desc    Toggle user verification status
// @route   PUT /api/auth/users/:id/verify
// @access  Private (Admin only)
const verifyUser = async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET verified = $1 WHERE id = $2 RETURNING id, name, email, role, verified, created_at',
      [verified === true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User verification status updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error in verifyUser controller:', error.message);
    return res.status(500).json({ error: 'Internal server error updating user verification.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  verifyUser
};
