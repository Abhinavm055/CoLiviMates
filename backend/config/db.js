const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in the backend environment configuration');
  process.exit(1);
}

// Configure pg connection pool with SSL settings required by Neon PostgreSQL
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for connection to Neon serverless DB
  }
});

// Test connection immediately on server boot
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to establish database connection:', err.message);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

module.exports = pool;
