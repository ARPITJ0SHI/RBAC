# Role-Based Access Control (RBAC) System

A full-stack RBAC system built with React, Node.js, Express, and MongoDB. This system provides a flexible and secure way to manage user permissions and roles in your application.

## Features

- **User Management**
  - Create, read, update, and delete users
  - Assign roles to users
  - Enable/disable user accounts
  - Multi-factor authentication support

- **Role Management**
  - Hierarchical role structure
  - Inherit permissions from parent roles
  - Create, read, update, and delete roles
  - Assign multiple permissions to roles

- **Permission Management**
  - Fine-grained permission control
  - Category-based permission organization
  - Create, read, update, and delete permissions
  - Bulk permission updates

- **Security Features**
  - JWT-based authentication
  - Password hashing with bcrypt
  - MFA support
  - Session management
  - Activity logging

## Tech Stack

### Frontend
- React
- Material-UI (MUI)
- React Router
- Context API for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Winston for logging

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
MFA_SECRET=your_mfa_secret
```

5. Run the database seeder:
```bash
cd backend
node src/seeders/runSeeder.js
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

### Default Admin Credentials
- Email: admin@gmail.com
- Password: admin123

## Project Structure

### Backend
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   ├── seeders/        # Database seeders
│   └── server.js       # Entry point
```

### Frontend
```
frontend/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # Context providers
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── App.js         # Root component
```

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh-token
- POST /api/auth/verify-mfa

### Users
- GET /api/users
- POST /api/users
- GET /api/users/:id
- PATCH /api/users/:id
- DELETE /api/users/:id

### Roles
- GET /api/roles
- POST /api/roles
- GET /api/roles/:id
- PATCH /api/roles/:id
- DELETE /api/roles/:id
- GET /api/roles/:id/effective-permissions

### Permissions
- GET /api/permissions
- POST /api/permissions
- GET /api/permissions/:id
- PATCH /api/permissions/:id
- DELETE /api/permissions/:id
- PATCH /api/permissions/bulk-update

