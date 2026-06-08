const pool = require('../config/db');

const migrate = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS contact_requests (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contact_requests_owner_id ON contact_requests(owner_id);
    CREATE INDEX IF NOT EXISTS idx_contact_requests_tenant_id ON contact_requests(tenant_id);
  `;
  
  try {
    console.log('Running migration to create contact_requests table...');
    await pool.query(query);
    console.log('Migration ran successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to run migration:', error.message);
    process.exit(1);
  }
};

migrate();
