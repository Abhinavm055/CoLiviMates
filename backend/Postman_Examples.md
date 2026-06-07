# CoLiviMates API - Postman Collection & Request/Response Examples

Below are the exact HTTP routes, methods, headers, and request/response payloads to test all Listings and Roommate Requests CRUD endpoints.

---

## SECTION 1: LISTINGS CRUD

### 1. Create a Listing
* **URL**: `http://localhost:5000/api/listings`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>` (Must be from a user with the role `owner` or `admin`)

#### Request Body (JSON)
```json
{
  "title": "Cozy Single Sharing Room near Christ University",
  "description": "Clean, fully-furnished room ideal for students. Includes daily meals, high-speed WiFi, laundry service, and 24/7 security. Just a 5-minute walk to the main campus.",
  "rent": 7500,
  "location": "Hosur Road",
  "city": "Bengaluru",
  "sharing_type": "single",
  "facilities": ["WiFi", "Meals Included", "Laundry", "Security", "Geyser"],
  "images": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"],
  "available_from": "2026-07-01"
}
```

#### Response (201 Created)
```json
{
  "message": "Listing created successfully",
  "listing": {
    "id": 1,
    "title": "Cozy Single Sharing Room near Christ University",
    "description": "Clean, fully-furnished room ideal for students. Includes daily meals, high-speed WiFi, laundry service, and 24/7 security. Just a 5-minute walk to the main campus.",
    "rent": 7500,
    "location": "Hosur Road",
    "city": "Bengaluru",
    "sharing_type": "single",
    "facilities": ["WiFi", "Meals Included", "Laundry", "Security", "Geyser"],
    "images": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"],
    "owner_id": 2,
    "status": "pending",
    "verified": false,
    "created_at": "2026-06-06T13:13:59.200Z",
    "available_from": "2026-07-01T00:00:00.000Z",
    "owner_name": "Listing Owner"
  }
}
```

---

### 2. Get All Listings (Public with Pagination & Filters)
* **URL**: `http://localhost:5000/api/listings`
* **Method**: `GET`
* **Query Parameters**:
  * `page`: `1` (optional)
  * `limit`: `5` (optional)
  * `city`: `Bengaluru` (optional, case-insensitive partial match)
  * `minRent`: `5000` (optional)
  * `maxRent`: `8000` (optional)
  * `sharingType`: `single` (optional)

#### Response (200 OK)
```json
{
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalCount": 1,
    "totalPages": 1
  },
  "listings": [
    {
      "id": 1,
      "title": "Cozy Single Sharing Room near Christ University",
      "description": "Clean, fully-furnished room...",
      "rent": 7500,
      "location": "Hosur Road",
      "city": "Bengaluru",
      "sharing_type": "single",
      "facilities": ["WiFi", "Meals Included", "Laundry", "Security", "Geyser"],
      "images": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"],
      "owner_id": 2,
      "status": "pending",
      "verified": false,
      "created_at": "2026-06-06T13:13:59.200Z",
      "available_from": "2026-07-01T00:00:00.000Z",
      "owner_name": "Listing Owner"
    }
  ]
}
```

---

### 3. Get Listing by ID (Public)
* **URL**: `http://localhost:5000/api/listings/:id`
* **Method**: `GET`

#### Response (200 OK)
```json
{
  "listing": {
    "id": 1,
    "title": "Cozy Single Sharing Room near Christ University",
    "description": "Clean, fully-furnished room ideal for students...",
    "rent": 7500,
    "location": "Hosur Road",
    "city": "Bengaluru",
    "sharing_type": "single",
    "owner_id": 2,
    "owner_name": "Listing Owner"
  }
}
```

---

### 4. Update Listing
* **URL**: `http://localhost:5000/api/listings/:id`
* **Method**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>` (Must be listing owner or admin)

#### Request Body (JSON - Partial updates supported)
```json
{
  "title": "Premium Single PG near Christ University (Hebbal)",
  "rent": 8000,
  "facilities": ["WiFi", "Meals Included", "Laundry", "Security", "Geyser", "AC"]
}
```

#### Response (200 OK)
```json
{
  "message": "Listing updated successfully",
  "listing": {
    "id": 1,
    "title": "Premium Single PG near Christ University (Hebbal)",
    "rent": 8000,
    "location": "Hosur Road",
    "city": "Bengaluru",
    "sharing_type": "single",
    "facilities": ["WiFi", "Meals Included", "Laundry", "Security", "Geyser", "AC"],
    "owner_id": 2,
    "owner_name": "Listing Owner"
  }
}
```

---

### 5. Delete Listing
* **URL**: `http://localhost:5000/api/listings/:id`
* **Method**: `DELETE`
* **Headers**:
  * `Authorization: Bearer <JWT_TOKEN>` (Must be listing owner or admin)

#### Response (200 OK)
```json
{
  "message": "Listing deleted successfully"
}
```

---

## SECTION 2: ROOMMATE REQUESTS CRUD

### 6. Create a Roommate Request
* **URL**: `http://localhost:5000/api/roommate-requests`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>` (Any authenticated user can create)

#### Request Body (JSON)
```json
{
  "title": "Looking for female flatmate in Viman Nagar",
  "description": "I am a 21-year-old engineering student looking for a studious, friendly, and clean flatmate to share a room. Vegetarian preferred. No smoking.",
  "budget": 5500,
  "preferred_location": "Viman Nagar, Pune",
  "sharing_type": "double"
}
```

#### Response (201 Created)
```json
{
  "message": "Roommate request created successfully",
  "roommateRequest": {
    "id": 1,
    "user_id": 3,
    "title": "Looking for female flatmate in Viman Nagar",
    "description": "I am a 21-year-old engineering student looking for a studious, friendly, and clean flatmate to share a room. Vegetarian preferred. No smoking.",
    "budget": 5500,
    "preferred_location": "Viman Nagar, Pune",
    "sharing_type": "double",
    "status": "active",
    "created_at": "2026-06-06T13:19:23.400Z",
    "user_name": "User Alpha"
  }
}
```

---

### 7. Get All Roommate Requests (Public with Pagination & Filters)
* **URL**: `http://localhost:5000/api/roommate-requests`
* **Method**: `GET`
* **Query Parameters**:
  * `page`: `1` (optional)
  * `limit`: `5` (optional)
  * `city`: `Pune` (optional, case-insensitive partial match on `preferred_location`)
  * `minBudget`: `5000` (optional)
  * `maxBudget`: `6000` (optional)
  * `sharingType`: `double` (optional)

#### Response (200 OK)
```json
{
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalCount": 1,
    "totalPages": 1
  },
  "roommateRequests": [
    {
      "id": 1,
      "user_id": 3,
      "title": "Looking for female flatmate in Viman Nagar",
      "description": "I am a 21-year-old engineering student...",
      "budget": 5500,
      "preferred_location": "Viman Nagar, Pune",
      "sharing_type": "double",
      "status": "active",
      "created_at": "2026-06-06T13:19:23.400Z",
      "user_name": "User Alpha"
    }
  ]
}
```

---

### 8. Get Roommate Request by ID (Public)
* **URL**: `http://localhost:5000/api/roommate-requests/:id`
* **Method**: `GET`

#### Response (200 OK)
```json
{
  "roommateRequest": {
    "id": 1,
    "user_id": 3,
    "title": "Looking for female flatmate in Viman Nagar",
    "description": "I am a 21-year-old engineering student...",
    "budget": 5500,
    "preferred_location": "Viman Nagar, Pune",
    "sharing_type": "double",
    "status": "active",
    "created_at": "2026-06-06T13:19:23.400Z",
    "user_name": "User Alpha"
  }
}
```

---

### 9. Update Roommate Request
* **URL**: `http://localhost:5000/api/roommate-requests/:id`
* **Method**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>` (Must be creator of the request or admin)

#### Request Body (JSON - Partial updates supported)
```json
{
  "title": "Looking for female flatmate in Viman Nagar, Pune (Premium)",
  "budget": 6000
}
```

#### Response (200 OK)
```json
{
  "message": "Roommate request updated successfully",
  "roommateRequest": {
    "id": 1,
    "user_id": 3,
    "title": "Looking for female flatmate in Viman Nagar, Pune (Premium)",
    "description": "I am a 21-year-old engineering student...",
    "budget": 6000,
    "preferred_location": "Viman Nagar, Pune",
    "sharing_type": "double",
    "status": "active",
    "created_at": "2026-06-06T13:19:23.400Z",
    "user_name": "User Alpha"
  }
}
```

---

### 10. Delete Roommate Request
* **URL**: `http://localhost:5000/api/roommate-requests/:id`
* **Method**: `DELETE`
* **Headers**:
  * `Authorization: Bearer <JWT_TOKEN>` (Must be creator of the request or admin)

#### Response (200 OK)
```json
{
  "message": "Roommate request deleted successfully"
}
```
