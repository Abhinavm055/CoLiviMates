const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const roommateRequestRoutes = require('./routes/roommateRequests');

const app = express();

// Configure CORS to allow access from the React frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware to parse incoming JSON payloads
app.use(express.json());
// Middleware to parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Co-Living Space Finder Backend API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CoLiviMates Backend Running',
    status: 'UP'
  });
});

// Database Status Route
app.get('/api/db-status', async (req, res) => {
  const startTime = Date.now();
  try {
    const result = await pool.query('SELECT NOW() as db_time');
    const latency = Date.now() - startTime;
    res.status(200).json({
      status: 'UP',
      database: 'connected',
      latency: `${latency}ms`,
      dbTime: result.rows[0].db_time,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
// Authentication Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/roommate-requests', roommateRequestRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
