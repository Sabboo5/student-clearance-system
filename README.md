# Student Clearance Management System

A full-stack web application for managing student graduation clearance requests. Built with React, Node.js, Express, MongoDB, and TypeScript.

## Features

- **Role-Based Access Control**: Student, Department Officer, and Admin roles
- **JWT Authentication**: Secure login/registration with token-based auth
- **Clearance Workflow**: Students submit requests; officers review per department
- **Real-time Status Tracking**: Track clearance progress across 6 departments
- **Document Uploads**: Students can upload supporting documents per department
- **Notifications**: Automated notifications for status changes
- **Audit Logs**: Full audit trail of all system actions
- **Analytics Dashboard**: Admin dashboard with statistics and charts
- **Report Generation**: Summary and detailed report generation with date filters
- **Search & Filtering**: Search and filter across all views
- **Responsive Design**: Fully responsive UI with Tailwind CSS

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS  |
| Backend    | Node.js, Express, TypeScript        |
| Database   | MongoDB with Mongoose ODM           |
| Auth       | JWT (JSON Web Tokens)               |
| Build      | Vite (frontend), tsc (backend)      |
| Container  | Docker & Docker Compose             |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, upload middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── server.ts        # Express app entry point
│   │   └── seed.ts          # Database seeder
│   ├── uploads/             # Uploaded documents
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin dashboard, user mgmt, audit logs, reports
│   │   │   ├── auth/        # Login and Register pages
│   │   │   ├── layout/      # Sidebar, Navbar, Layout
│   │   │   ├── officer/     # Officer dashboard
│   │   │   ├── shared/      # Reusable components
│   │   │   └── student/     # Student dashboard, clearance views
│   │   ├── context/         # React context (AuthContext)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd clearance-management-system
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Seed the database (in another terminal):**
   ```bash
   docker exec -it clearance-backend node dist/seed.js
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27017

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
cp .env.example .env     # Edit .env with your MongoDB URI
npm install
npm run seed             # Seed the database with test data
npm run dev              # Start development server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev              # Start dev server on port 3000
```

The frontend dev server proxies `/api` requests to the backend on port 5000.

## Demo Accounts

After seeding the database, use these accounts:

| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Admin   | admin@university.edu         | admin123   |
| Officer | library@university.edu       | officer123 |
| Officer | finance@university.edu       | officer123 |
| Officer | dormitory@university.edu     | officer123 |
| Officer | registrar@university.edu     | officer123 |
| Officer | laboratory@university.edu    | officer123 |
| Officer | departmenthead@university.edu| officer123 |
| Student | student1@university.edu      | student123 |
| Student | student2@university.edu      | student123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Clearance Requests
- `POST /api/clearance` - Create clearance request (Student)
- `GET /api/clearance` - List clearance requests (filtered by role)
- `GET /api/clearance/:id` - Get request details
- `PUT /api/clearance/:id/review` - Review department clearance (Officer)
- `POST /api/clearance/:id/upload` - Upload document

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/reports` - Generate reports

## Database Schema

### User
- name, email, password (hashed), role (student/officer/admin)
- studentId (for students), department (for officers), isActive

### ClearanceRequest
- student (ref), academicYear, reason, overallStatus
- departmentClearances: array of { department, status, officer, comment, documents }

### AuditLog
- user (ref), action, resource, resourceId, details, ipAddress

### Notification
- user (ref), title, message, type (info/success/warning/error), read, link

## Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT-based authentication with configurable expiry
- Role-based access control middleware
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation
- File upload restrictions (type and size)
