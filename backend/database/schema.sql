-- database/schema.sql
-- PostgreSQL Database Schema for Co-Living Space Finder (CoLiviMates)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'tenant', -- 'tenant', 'owner', 'admin'
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on user email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rent INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    sharing_type VARCHAR(50) NOT NULL, -- 'single', 'double', 'triple', 'dormitory'
    facilities TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    available_from DATE NOT NULL
);

-- Indexes for listings queries (by owner, city, and rent range)
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_rent ON listings(rent);

-- 3. Roommate Requests Table
CREATE TABLE IF NOT EXISTS roommate_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget INTEGER NOT NULL,
    preferred_location VARCHAR(255) NOT NULL,
    sharing_type VARCHAR(50) NOT NULL, -- 'single', 'double', 'triple', 'dormitory'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for roommate requests
CREATE INDEX IF NOT EXISTS idx_roommate_requests_user_id ON roommate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_budget ON roommate_requests(budget);

-- 4. Contact Requests Table
CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_owner_id ON contact_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_tenant_id ON contact_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_listing_id ON contact_requests(listing_id);
