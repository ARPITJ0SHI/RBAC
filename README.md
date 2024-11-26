# RBAC Admin Dashboard

A secure and efficient Role-Based Access Control system built with React and Material-UI, featuring comprehensive user management, role hierarchies, and granular permissions.

## Core Features

- **User Management**: CRUD operations, role assignments, and bulk actions
- **Role Hierarchy**: Flexible role creation with inheritance and cloning capabilities
- **Permission System**: Fine-grained access control with conflict detection
- **Security**: MFA support, session management, and activity logging
- **Modern UI**: Responsive design with Material-UI components

## Quick Start

Prerequisites: Node.js v14+

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev
```

Access the dashboard at `http://localhost:5173`

Default login:
```
Email: admin@gmail.com
Password: admin123
```

## Architecture

```
frontend/
├── src/
│   ├── components/     # UI components
│   ├── contexts/       # React contexts
│   ├── services/       # API layer
│   ├── hooks/          # Custom hooks
│   └── theme.js        # Theme config
```

## Tech Stack

- React 18
- Material-UI v5
- React Router v6
- JWT Authentication