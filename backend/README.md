# Sent - Backend API

Backend API for Sent, a time-based letter delivery application built with Node.js, Express, and MongoDB.

## Features

- 🔐 User authentication with JWT
- 📮 Create and schedule letters for future delivery
- 📬 Automatic letter delivery based on scheduled time
- 🔒 Secure password hashing with bcrypt
- ✅ Input validation
- 🚀 RESTful API design

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sent-app
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Letter Routes (`/api/letters`)

- `POST /api/letters` - Create a new letter (Protected)
- `GET /api/letters/sent` - Get sent letters (Protected)
- `GET /api/letters/received` - Get received letters (Protected)
- `GET /api/letters/:id` - Get single letter (Protected)
- `PUT /api/letters/:id` - Update letter (Protected)
- `DELETE /api/letters/:id` - Delete letter (Protected)
- `POST /api/letters/process-deliveries` - Process pending deliveries

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── letterController.js # Letter CRUD logic
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── errorHandler.js    # Error handling middleware
├── models/
│   ├── User.js            # User model
│   └── Letter.js          # Letter model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   └── letterRoutes.js    # Letter routes
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── server.js              # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/sent-app |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `NODE_ENV` | Environment mode | development |

## API Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "password": "password123",
  "gender": "male"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+1234567890",
  "password": "password123"
}
```

### Create Letter
```bash
POST /api/letters
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Future Me",
  "message": "Remember to stay positive!",
  "deliveryDate": "2026-12-25T00:00:00.000Z",
  "category": "personal",
  "emoji": "📮"
}
```

## License

ISC
