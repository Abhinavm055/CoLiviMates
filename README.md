# 🏠 CoLiviMates - Co-Living Space Finder

**CoLiviMates** is a modern, responsive web application designed to connect tenants, property owners, and roommates in a seamless, secure, and intuitive platform. 

The application facilitates role-based access for Tenants (seeking spaces or roommate matches), Owners (listing properties), and Admins (verifying users and reviewing listing submissions).

---

## 📌 Project Architecture & Technologies

### Frontend
- **Framework:** React 18 (Vite-powered for rapid development)
- **Styling:** Tailwind CSS & shadcn/ui components (fully responsive design)
- **State & Router:** React Router DOM (v6)
- **API Client:** Axios (featuring JWT auto-injection and request/error interceptors)

### Backend
- **Framework:** Node.js & Express
- **Database:** PostgreSQL (Hosted on Neon serverless postgres)
- **SQL Pool:** `pg` pool client
- **Security:** `bcrypt` for secure hashing, JWT (`jsonwebtoken`) for session management
- **Environment:** `dotenv` for configuration separation

---

## 🚀 Setup & Run Locally

### Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 1. Database Setup
The backend is configured to connect to a PostgreSQL database. Set up the schema by executing:
```sh
# Connect to your PostgreSQL database instance and run the schema script:
psql -h <host> -U <user> -d <database> -f backend/database/schema.sql
```

### 2. Backend Environment Config
Create a file named `.env` in the `/backend` folder:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_jwt_signing_secret_here
```

### 3. Running the Servers

#### Start the Backend Server
```sh
cd backend
npm install
npm run dev    # Starts the server using nodemon
```
The server will run on `http://localhost:5000` and output database connection status.

#### Start the Frontend Server
```sh
# From the root directory:
npm install
npm run dev    # Starts Vite dev server
```
The frontend will run on `http://localhost:8080`.

---

## 🧪 Running Integration Tests
The project features a dedicated suite of backend integration tests that validate all authentication, database inserts, and CRUD operations.

To execute the test suites, run the backend server first, then execute the following commands in the `/backend` folder:
```sh
# Test Authentication & Profile routes
node test_auth.js

# Test Listings CRUD operations
node test_listings.js

# Test Roommate Requests CRUD operations
node test_roommate_requests.js
```

---

## 🛠️ API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new account (Tenant, Owner, or Admin).
- `POST /api/auth/login` - Authenticate credentials and receive JWT.
- `GET /api/auth/me` - Fetch profile details of the authenticated session.
- `GET /api/auth/users` - Fetch list of all registered users (Admin only).
- `PUT /api/auth/users/:id/verify` - Toggle user verified badge (Admin only).

### Listings Endpoints
- `POST /api/listings` - Submit a new housing listing (Owners & Admins only).
- `GET /api/listings` - Fetch paginated and filtered listings (Public).
- `GET /api/listings/:id` - Fetch single listing details (Public).
- `PUT /api/listings/:id` - Edit listing fields, including status approval (Owner/Admin only).
- `DELETE /api/listings/:id` - Delete a listing (Owner/Admin only).

### Roommate Matches Endpoints
- `POST /api/roommate-requests` - Submit a flatmate matching request (Authenticated users).
- `GET /api/roommate-requests` - Query paginated flatmate requests (Public).
- `GET /api/roommate-requests/:id` - View details of a request (Public).
- `PUT /api/roommate-requests/:id` - Update request fields (Creator/Admin only).
- `DELETE /api/roommate-requests/:id` - Delete request (Creator/Admin only).
