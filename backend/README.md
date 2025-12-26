# Backend - GitHub API Integration

Express.js + TypeScript backend with JWT authentication and GitHub API integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Initialize database and seed users
npm run init-db

# Start development server
npm run dev
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login
Body: { "email": "string", "password": "string" }
Response: { "token": "string", "user": {...} }
```

### Users (Protected)
```
GET /api/users/me
Headers: { "Authorization": "Bearer <token>" }
Response: { "id": 1, "name": "...", "email": "...", "role": "..." }

GET /api/users
Headers: { "Authorization": "Bearer <token>" }
Response: [{ "id": 1, "name": "...", ... }]
Note: Admin only
```

### GitHub (Protected)
```
GET /api/github/profile/:username
Headers: { "Authorization": "Bearer <token>" }
Response: { GitHub profile data }

GET /api/github/repos/:username
Headers: { "Authorization": "Bearer <token>" }
Query: ?page=1&per_page=30
Response: [{ GitHub repository data }]
```

## 🗄️ Database Schema

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🔐 Authentication

- JWT tokens with configurable expiration
- Password hashing using bcrypt (10 rounds)
- Bearer token authentication
- Role-based authorization (admin/user)

## 📁 Project Structure

```
src/
├── controllers/      # Request handlers
│   ├── authController.ts
│   ├── userController.ts
│   └── githubController.ts
├── database/        # Database setup
│   ├── db.ts
│   └── init.ts
├── middleware/      # Express middleware
│   ├── auth.ts
│   └── errorHandler.ts
├── models/          # Data models
│   └── User.ts
├── routes/          # API routes
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   └── githubRoutes.ts
├── types/           # TypeScript types
│   └── index.ts
├── utils/           # Utility functions
│   └── jwt.ts
└── index.ts         # Application entry
```

## 🛠️ Scripts

```bash
npm run dev       # Start with hot reload
npm run build     # Build for production
npm start         # Run production build
npm run init-db   # Initialize database
```

## 🔧 Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
DATABASE_PATH=./database.sqlite
GITHUB_TOKEN=optional-github-token
```

## 📦 Dependencies

- **express** - Web framework
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **sqlite3** - Database
- **axios** - HTTP client
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Protected routes via middleware
- Role-based access control
- Error handling without stack traces in production
