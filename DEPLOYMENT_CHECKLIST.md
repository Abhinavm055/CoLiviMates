# 🚀 CoLiviMates Production Deployment Checklist

This document details the checklist and configuration guide to deploy the CoLiviMates web application to a production environment.

---

## 📦 Phase 1: Database Migration
1. [ ] **Target Database Setup:** Instantiate a production-ready PostgreSQL database (e.g., AWS RDS, Neon PostgreSQL, or Heroku Postgres).
2. [ ] **SSL Configuration:** Verify the database supports SSL connections (required for cloud environments).
3. [ ] **Schema Deployment:** Execute `backend/database/schema.sql` on the production database to create tables and indexes.
4. [ ] **Indices Validation:** Confirm indexes are created for `users(email)`, `listings(rent, city, owner_id)`, and `roommate_requests(budget, user_id)` to ensure fast queries.

---

## ⚙️ Phase 2: Backend Deployment
1. [ ] **Host Selection:** Deploy the Node.js/Express server to a cloud provider (e.g., Render, Heroku, AWS Elastic Beanstalk, or DigitalOcean App Platform).
2. [ ] **Environment Variables Configuration:** Set up the following environment variables in the host dashboard:
   - `PORT`: Define the port (usually set dynamically by host, defaults to `5000` or `80`).
   - `NODE_ENV`: Set to `production`.
   - `DATABASE_URL`: Production connection string containing connection credentials with SSL enabled (`sslmode=require`).
   - `JWT_SECRET`: Generate a highly secure, random cryptographic secret for signing user tokens.
   - `FRONTEND_URL`: URL of the deployed React application (e.g., `https://colivimates.com` or Vercel domain).
3. [ ] **Build Check:** Ensure `npm install` installs correct production dependencies and ignores `devDependencies`.

---

## 💻 Phase 3: Frontend Deployment
1. [ ] **Host Selection:** Deploy the React static assets to a hosting provider (e.g., Vercel, Netlify, Cloudflare Pages, or AWS S3+CloudFront).
2. [ ] **Build Environment Configuration:** Configure the build command with:
   - `VITE_API_URL`: Point to the deployed backend server API route (e.g., `https://api.colivimates.com/api` or `https://colivimates-backend.onrender.com/api`).
3. [ ] **Asset Bundling:** Run `npm run build` locally or inside the CI/CD pipeline to compile minimized JS chunks and optimized CSS assets in the `/dist` directory.
4. [ ] **SPA Route Rewrites:** In production hosting, configure redirects so all routes point to `index.html` (vital for React Router HTML5 History API):
   - **Vercel (`vercel.json`):**
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - **Netlify (`_redirects`):**
     ```text
     /*   /index.html   200
     ```

---

## 🔒 Phase 4: Security & Networking
1. [ ] **SSL/TLS Certificates:** Install SSL certificates (HTTPS) for both frontend and backend domains (most hosts like Netlify/Vercel/Render automate this via Let's Encrypt).
2. [ ] **CORS Configuration:** Verify the backend's allowed CORS origin matches the exact production frontend domain.
3. [ ] **Casing & Trimming:** Ensure email casing validation matches database queries (`email.toLowerCase()`) to prevent duplicate entry attempts.
4. [ ] **Security Warning Suppression:** Prepare for PG connection string changes in v3/v9 by confirming the connection URL utilizes appropriate parameters if warnings exist.

---

## 🧪 Phase 5: Verification & Go-Live
1. [ ] **JWT Persistence Check:** Confirm that user sessions persist when the browser is refreshed in production (checks localStorage + `/auth/me`).
2. [ ] **CRUD Verification:** Create a new listing, edit it, and delete it to verify all database permissions are operating correctly.
3. [ ] **Admin Verification:** Log in as an admin account, approve a pending listing, and confirm it displays immediately on the public listings screen.
