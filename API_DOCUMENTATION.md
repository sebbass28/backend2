# FinanceFlow Backend - API Documentation

## Base URL
```
http://localhost:4000
```

---

## Authentication

All endpoints except `/api/auth/*` and `/health` require JWT authentication.

**Authorization Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

**Errors:**
- `400`: Email already registered
- `400`: Validation errors

---

### 1.2 Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

**Errors:**
- `401`: Invalid credentials

---

### 1.3 Refresh Token
**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_access_token"
}
```

**Errors:**
- `400`: No refresh token provided
- `401`: Invalid refresh token

---

### 1.4 Logout
**POST** `/api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "ok": true
}
```

---

## 2. User Endpoints

### 2.1 Get User Profile
**GET** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `403`: Forbidden (accessing another user's profile)
- `404`: User not found

---

### 2.2 Update User Profile
**PUT** `/api/users/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Doe",      // optional
  "email": "new@email.com" // optional
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "new@email.com",
    "name": "Jane Doe",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## 3. Transaction Endpoints

### 3.1 Create Transaction
**POST** `/api/transactions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "expense",           // "income" or "expense"
  "amount": 99.99,
  "currency": "EUR",           // optional, default "EUR"
  "category_id": "uuid",       // optional
  "description": "Groceries",  // optional
  "date": "2025-01-15T10:00:00.000Z" // optional, default now
}
```

**Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "expense",
    "amount": "99.99",
    "currency": "EUR",
    "category_id": "uuid",
    "description": "Groceries",
    "date": "2025-01-15T10:00:00.000Z",
    "receipt_url": null,
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Real-time Event:** Emits `transaction_created` via WebSocket to user's room

---

### 3.2 Get All Transactions
**GET** `/api/transactions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional, default 100): Number of transactions to return
- `offset` (optional, default 0): Offset for pagination
- `from` (optional): Start date filter (ISO 8601)
- `to` (optional): End date filter (ISO 8601)
- `category` (optional): Filter by category ID

**Example:**
```
GET /api/transactions?limit=50&offset=0&from=2025-01-01&category=uuid
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "expense",
      "amount": "99.99",
      "currency": "EUR",
      "category_id": "uuid",
      "category_name": "Food",
      "description": "Groceries",
      "date": "2025-01-15T10:00:00.000Z",
      "receipt_url": null,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3.3 Get Transaction by ID
**GET** `/api/transactions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "expense",
    "amount": "99.99",
    "currency": "EUR",
    "category_id": "uuid",
    "description": "Groceries",
    "date": "2025-01-15T10:00:00.000Z",
    "receipt_url": "path/to/receipt.jpg",
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Transaction not found

---

### 3.4 Update Transaction
**PUT** `/api/transactions/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body (all fields optional):**
```json
{
  "type": "income",
  "amount": 150.00,
  "currency": "EUR",
  "category_id": "uuid",
  "description": "Updated description",
  "date": "2025-01-16T10:00:00.000Z",
  "receipt_url": "path/to/receipt.jpg"
}
```

**Response (200):**
```json
{
  "transaction": {
    // updated transaction object
  }
}
```

**Real-time Event:** Emits `transaction_updated` via WebSocket

**Errors:**
- `400`: No fields to update
- `404`: Transaction not found or unauthorized

---

### 3.5 Delete Transaction
**DELETE** `/api/transactions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "ok": true
}
```

**Real-time Event:** Emits `transaction_deleted` via WebSocket

**Errors:**
- `404`: Transaction not found

---

### 3.6 Upload Receipt
**POST** `/api/transactions/:id/receipt`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `receipt`: File (image/pdf)

**Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "receipt_url": "user_id/timestamp-filename.jpg",
    // ... other fields
  },
  "signedUrl": "https://supabase.co/storage/v1/object/sign/...",
  "expires_in": 3600
}
```

**Note:** The `signedUrl` is temporary and expires after the specified time.

**Errors:**
- `400`: No file provided
- `404`: Transaction not found
- `500`: Upload failed

---

### 3.7 Get Receipt Signed URL
**GET** `/api/transactions/:id/receipt`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "signedUrl": "https://supabase.co/storage/v1/object/sign/...",
  "expires_in": 3600
}
```

**Errors:**
- `404`: Transaction not found or no receipt uploaded

---

## 4. Category Endpoints

### 4.1 Create Category
**POST** `/api/categories`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Food",
  "color": "#FF5733" // optional
}
```

**Response (200):**
```json
{
  "category": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Food",
    "color": "#FF5733",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 4.2 Get All Categories
**GET** `/api/categories`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Food",
      "color": "#FF5733",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "user_id": null,
      "name": "Default Category",
      "color": null,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** Returns both user-specific categories and shared categories (where `user_id` is null).

---

### 4.3 Get Category by ID
**GET** `/api/categories/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "category": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Food",
    "color": "#FF5733",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Category not found

---

### 4.4 Update Category
**PUT** `/api/categories/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body (all fields optional):**
```json
{
  "name": "Updated Food",
  "color": "#00FF00"
}
```

**Response (200):**
```json
{
  "category": {
    // updated category object
  }
}
```

**Errors:**
- `404`: Category not found or unauthorized

---

### 4.5 Delete Category
**DELETE** `/api/categories/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- `404`: Category not found or unauthorized

---

## 5. Budget Endpoints

### 5.1 Create Budget
**POST** `/api/budgets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category_id": "uuid",
  "limit_amount": 500.00,
  "period": "monthly" // "monthly", "weekly", or "yearly"
}
```

**Response (201):**
```json
{
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "limit_amount": "500.00",
    "period": "monthly",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 5.2 Get All Budgets
**GET** `/api/budgets`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "budgets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "limit_amount": "500.00",
      "period": "monthly",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5.3 Get Budget by ID
**GET** `/api/budgets/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "limit_amount": "500.00",
    "period": "monthly",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Budget not found

---

### 5.4 Update Budget
**PUT** `/api/budgets/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body (all fields optional):**
```json
{
  "category_id": "uuid",
  "limit_amount": 600.00,
  "period": "weekly"
}
```

**Response (200):**
```json
{
  "budget": {
    // updated budget object
  }
}
```

**Errors:**
- `400`: No fields to update
- `404`: Budget not found or unauthorized

---

### 5.5 Delete Budget
**DELETE** `/api/budgets/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
- `404`: Budget not found

---

## 6. Report Endpoints

### 6.1 Get Monthly Balance
**GET** `/api/reports/monthly-balance`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "monthlyBalance": [
    {
      "month": "2025-01-01T00:00:00.000Z",
      "total_income": "5000.00",
      "total_expense": "3500.00"
    },
    {
      "month": "2024-12-01T00:00:00.000Z",
      "total_income": "4800.00",
      "total_expense": "3200.00"
    }
  ]
}
```

**Note:** Returns last 12 months

---

### 6.2 Get Expenses by Category
**GET** `/api/reports/expenses-by-category`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "expensesByCategory": [
    {
      "category_name": "Food",
      "total_expense": "1500.00"
    },
    {
      "category_name": "Transport",
      "total_expense": "800.00"
    }
  ]
}
```

---

### 6.3 Get Yearly Trend
**GET** `/api/reports/yearly-trend`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "yearlyTrend": [
    {
      "year": "2025-01-01T00:00:00.000Z",
      "total_income": "60000.00",
      "total_expense": "42000.00"
    },
    {
      "year": "2024-01-01T00:00:00.000Z",
      "total_income": "55000.00",
      "total_expense": "38000.00"
    }
  ]
}
```

---

## 7. Health Check

### 7.1 Health Status
**GET** `/health`

**No authentication required**

**Response (200):**
```json
{
  "ok": true,
  "env": "development"
}
```

---

## 8. WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4000');

// Join user's private room
socket.emit('join_user_room', userId);
```

### Events Emitted by Server

#### transaction_created
Emitted when a new transaction is created
```javascript
socket.on('transaction_created', (transaction) => {
  console.log('New transaction:', transaction);
});
```

#### transaction_updated
Emitted when a transaction is updated
```javascript
socket.on('transaction_updated', (transaction) => {
  console.log('Updated transaction:', transaction);
});
```

#### transaction_deleted
Emitted when a transaction is deleted
```javascript
socket.on('transaction_deleted', ({ id }) => {
  console.log('Deleted transaction ID:', id);
});
```

---

## 9. Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message",
  "errors": [
    {
      "msg": "Email is not valid",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token"
}
```
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later."
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

---

## 10. Rate Limiting

- **Window:** 60 seconds (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests:** 200 per window (configurable via `RATE_LIMIT_MAX`)
- Applied to all endpoints

---

## 11. Environment Variables

Required environment variables (see `.env` file):

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=your-bucket-name

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Uploads
UPLOAD_DIR=./src/uploads

# Rate Limiter
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200

# Signed URLs
SIGNED_URL_TTL_SEC=3600
```

---

## 12. Database Setup

Run the initialization SQL script to create all required tables:

```bash
psql -U postgres -d your_database -f init.sql
```

Or if using Supabase, copy the contents of `init.sql` and run in the SQL editor.

---

## 13. Development

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

---

## Notes for Frontend Integration

1. **CORS:** Currently configured to accept all origins. For production, configure specific origins in `app.js`.

2. **File Uploads:** Use `multipart/form-data` for receipt uploads.

3. **WebSocket:** Connect to the same port as the HTTP server (4000).

4. **Signed URLs:** Receipt URLs are temporary. Request new signed URLs when needed.

5. **Token Refresh:** Implement token refresh logic when receiving 401 errors.

6. **Real-time Updates:** Subscribe to WebSocket events for real-time transaction updates.

---

## Example Frontend Integration

### Login and Store Token
```javascript
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});

const { token, refreshToken, user } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('refreshToken', refreshToken);
```

### Make Authenticated Request
```javascript
const response = await fetch('http://localhost:4000/api/transactions', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

const { transactions } = await response.json();
```

### Upload Receipt
```javascript
const formData = new FormData();
formData.append('receipt', fileInput.files[0]);

const response = await fetch(`http://localhost:4000/api/transactions/${transactionId}/receipt`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData
});

const { transaction, signedUrl } = await response.json();
```

### WebSocket Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000');
socket.emit('join_user_room', userId);

socket.on('transaction_created', (transaction) => {
  // Update UI with new transaction
});
```

---

**Last Updated:** 2025-10-09
**API Version:** 1.0.0
