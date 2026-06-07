// database/initDb.js
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Initializing database schema...');
    
    // Execute the schema SQL queries
    await pool.query(schemaSql);
    
    console.log('Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
};

initDb();
