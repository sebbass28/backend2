# FinanceFlow Backend

FinanceFlow is a backend application designed to manage personal finance, including features for transaction tracking, budgeting, and reporting. This project is built using Node.js, Express, and PostgreSQL, with additional support for real-time notifications and scheduled jobs.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- Secure user authentication with JWT
- CRUD operations for transactions, budgets, and categories
- Upload and manage receipts
- Real-time notifications using WebSocket
- Scheduled jobs for monthly summaries
- CSV export of transaction data
- Rate limiting and input validation for security

## Technologies

- Node.js
- Express
- PostgreSQL
- Socket.io
- Node-cron
- Bcrypt
- JSON Web Tokens (JWT)
- Multer for file uploads
- dotenv for environment variables

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd financeflow-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in the required values.

4. **Set up the database:**
   If using Docker, run:
   ```bash
   docker-compose up
   ```
   This will start the PostgreSQL database and initialize it using `init.sql`.

5. **Run the application:**
   ```bash
   npm run dev
   ```

## Usage

The application runs on `http://localhost:4000`. You can use tools like Postman or curl to interact with the API.

## API Endpoints

- **Authentication**
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: Log in a user
  - `POST /api/auth/refresh`: Refresh JWT token
  - `POST /api/auth/logout`: Log out a user

- **Transactions**
  - `POST /api/transactions`: Create a new transaction
  - `GET /api/transactions`: Retrieve transactions
  - `GET /api/transactions/:id`: Get a specific transaction
  - `PUT /api/transactions/:id`: Update a transaction
  - `DELETE /api/transactions/:id`: Delete a transaction
  - `POST /api/transactions/:id/receipt`: Upload a receipt for a transaction

- **Budgets**
  - Similar CRUD operations as transactions.

- **Categories**
  - Similar CRUD operations as transactions.

- **Reports**
  - Generate various financial reports based on transactions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.# backend2
