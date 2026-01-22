## Farmlingo Backend (Node.js/TypeScript API)

A clean, modular, and scalable Node.js backend API for the Farmlingo platform.
This backend provides a solid foundation with routing, middleware, environment configuration, and a built-in `/health` status endpoint.

---

## 🚀 Recent Updates & Improvements

### ✅ Critical Bug Fixes (January 2026)

#### 1. **Authentication Standardization**
- **Fixed**: Mixed authentication middleware usage (`authenticate` vs `clerkAuth`)
- **Impact**: All routes now use consistent `clerkAuth` middleware
- **Files Updated**: `src/routes/courses.route.ts`, `src/routes/lessons.route.ts`

#### 2. **MVC Architecture Compliance**
- **Fixed**: Weather routes contained business logic directly in route handlers
- **Impact**: Proper separation of concerns with controllers handling business logic
- **Files Updated**: `src/routes/weather.route.ts`, `src/controllers/weather.controller.ts` (NEW)

#### 3. **Error Handling Standardization**
- **Fixed**: Inconsistent error handling patterns across endpoints
- **Impact**: All controllers now use `next(err)` pattern for consistent error handling
- **Files Updated**: All controller files

---

## What This Backend Includes

- Modular Express architecture
- Health check endpoint (`/health`)
- Built-in middleware: **helmet**, **cors**, **morgan**
- Centralized configuration via `.env`
- Error-handling middleware
- Lightweight logger utility
- Ready-to-use folder structure

---

# 1. Requirements

Make sure the following are installed before setting up the backend:

- **Node.js 16 or later**
- **npm**

---

# 2. Installation & Setup

Follow these steps to get the backend running locally.

---

## **Step 1 — Clone the project**

```bash
git clone <your-repo-url>
cd farmlingo_backend-API
```

---

## **Step 2 — Install dependencies**

```bash
npm install
```

---

## **Step 3 — Configure environment variables**

Create a `.env` file in the project root with values like:

```env
# Database (Neon Serverless)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require

# Auth
JWT_SECRET_KEY="change-me"
JWT_EXPIRES_IN=1h

# App Config
PORT=4002
NODE_ENV=development
APP_NAME=farmlingo-backend
API_VERSION=1.0.0
API_BASE_URL=http://localhost:4002/api

# Health defaults (optional)
HEALTH_OK_MESSAGE=ok
HEALTH_DB_STATUS=ok
HEALTH_CACHE_STATUS=ok
HEALTH_EXTERNAL_API_STATUS=ok
HEALTH_MESSAGE_BROKER_STATUS=ok
```

---

## **Step 4 — Run the backend**

### Development (with nodemon + ts-node)

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

The backend will start on the port specified in `.env` (default: **4002**).

Common URLs:

- **Root:** http://localhost:4002/
- **Health check:** http://localhost:4002/api/health
- **Users (secured):** http://localhost:4002/api/users (requires Bearer token)

---

# 🩺 3. Health Check Endpoint

The backend includes an `/api/health` route that returns the current server and dependency status.

### **GET /api/health**

### Example Response:

```json
{
  "status": "ok",
  "message": "ok",
  "uptime_seconds": 76,
  "version": "1.0.0",
  "timestamp": "2025-11-16T18:36:56.021Z",
  "env": "development",
  "details": {
    "database": "ok",
    "cache": "ok",
    "externalApi": "ok",
    "messageBroker": "ok"
  },
  "system": {
    "platform": "win32",
    "cpu_count": 8,
    "memory_total": 8265981952
  }
}
```

Use this endpoint to verify the backend is running successfully.

---

# 4. Project Structure

```
farmlingo_backend-API/
│
├── server.ts                # App entry point (TypeScript)
├── dist/                    # Compiled JS output (after `npm run build`)
├── .env                     # Environment variable configuration
├── src/
│   ├── app.ts               # Express app setup + middleware
│   ├── routes/              # API route definitions
│   ├── controllers/         # Functions that respond to requests
│   ├── middlewares/         # Custom middleware (logger, errors)
│   └── config/              # Environment config handling
├── utils/
│   └── logger.ts            # Lightweight logger utility
├── package.json
├── tsconfig.json
└── README.md
```

---

# 5. How to Use the Backend

### **Built-in endpoints**

- **GET /** → basic service status message.
- **GET /api/health** → detailed health and dependency status.
- **GET /api/users** → list users (secured; requires `Authorization: Bearer <token>`).

### **Add new routes**

Create a file in:

```
src/routes/
```

Register the route in `src/routes/index.ts` (mounted under `/api`).

### **Add controllers**

Add logic inside:

```
src/controllers/
```

### **Add middleware**

Place reusable middleware inside:

```
src/middlewares/
```

### **Update config values**

Modify environment settings inside `.env`.

---

# 6. Quick Testing

After starting the backend:

```bash
curl http://localhost:4002/api/health
```

Expected output:
A JSON object containing `"status": "ok"`.

---

# 7. Database: Drizzle ORM + Neon PostgreSQL

This project uses Drizzle ORM with a Neon PostgreSQL database.

- Connection string is provided via `DATABASE_URL` in `.env`.
- Schema is defined in TypeScript under `src/db/schema.ts`.
- Drizzle ORM is used at runtime via `src/db/dbconfig.ts` (Neon HTTP driver).

## 7.1. Provision a Neon database

1. Create a database on https://neon.tech
2. Copy your connection string (ensure `sslmode=require`).
3. Set it in `.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require
```

## 7.2. Apply the schema to the database

Use Drizzle Kit to push the schema defined in `src/db/schema.ts` to your Neon database:

```bash
npm run db:push
```

Optionally, open Drizzle Studio to inspect tables:

```bash
npm run db:studio
```

Note: If Drizzle complains about missing config, create a minimal `drizzle.config.ts` in the project root:

```ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies Config;
```

## 7.3. Database ERD

The ERD visualizes the relationships across users, courses, lessons, enrollments, forums, chat, quizzes, and related entities.

![Database ERD](./docs/erd.svg)

If the embedded images do not render, you can view the ERD directly using the link below:

[**Direct Sequence Diagram Link**](https://www.mermaidchart.com/d/19917d20-e7c7-413a-ba1a-070b1c446c34)

---

# 8. Environment configuration

Create a `.env` file at the project root. Example (matches this repo’s usage):

```env
# Database (Neon Serverless)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require

# Auth
JWT_SECRET_KEY="change-me"

# App Config
PORT=4002
NODE_ENV=development
APP_NAME=farmlingo-backend
API_VERSION=1.0.0

# Health defaults (optional)
HEALTH_OK_MESSAGE=ok
HEALTH_DB_STATUS=ok
HEALTH_CACHE_STATUS=ok
HEALTH_EXTERNAL_API_STATUS=ok
HEALTH_MESSAGE_BROKER_STATUS=ok
```

---

# 9. Running the project

## 9.1. Development

```bash
npm run dev
```

Starts Nodemon with ts-node. Logs will include the full server URL and Swagger UI.

## 9.2. Production

```bash
npm run build
npm start
```

Runs the compiled JavaScript from `dist/`.

---

# 10. API Documentation (Swagger)

- Swagger UI: `http://localhost:<PORT>/api-docs/#/` (example: http://localhost:4002/api-docs/#/)
- OpenAPI JSON: `http://localhost:<PORT>/api-docs.json`

Tags are ordered as:

1. Health
2. Users
3. Courses
4. Lessons
5. Enrollments
6. Forums
7. Chat

---

# 11. Authentication

Protected endpoints use Bearer JWTs. Obtain a token via the login route, then pass it as `Authorization: Bearer <token>`.

Example login (multipart/form-data):

```bash
curl -X POST http://localhost:4002/api/users/login \
  -H "Content-Type: multipart/form-data" \
  -F email=test@example.com
```

Use the returned `access_token` for subsequent requests:

```bash
curl http://localhost:4002/api/courses \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

# 12. Sending data as multipart/form-data

Create/Update endpoints now expect `multipart/form-data` for field-only forms. Send JSON-like fields as strings; the server will parse them.

Examples:

- Create course

```bash
curl -X POST http://localhost:4002/api/courses \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: multipart/form-data" \
  -F title="Intro to Hydroponics" \
  -F category=hydroponics \
  -F creator_id="<uuid>"
```

- Create lesson with metadata

```bash
curl -X POST http://localhost:4002/api/lessons \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: multipart/form-data" \
  -F course_id="<uuid>" \
  -F title="Nutrient Solutions" \
  -F metadata='{"difficulty":"easy"}'
```

- Create forum post with tags

```bash
curl -X POST http://localhost:4002/api/forums/<forumId>/posts \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: multipart/form-data" \
  -F user_id="<uuid>" \
  -F title="How to prevent root rot?" \
  -F content="I noticed some of my plants have root rot..." \
  -F tags='["help","hydroponics"]'
```

---

# 13. Available scripts

- `npm run dev` — start dev server (nodemon + ts-node)
- `npm run build` — TypeScript compile
- `npm start` — run compiled server from `dist`
- `npm run lint` — run ESLint
- `npm run db:push` — apply schema to DB using Drizzle Kit
- `npm run db:studio` — open Drizzle Studio

---

# 14. Troubleshooting

- Port already in use: change `PORT` in `.env` (e.g., 4002).
- JWT errors: ensure `JWT_SECRET_KEY` is set and consistent between login and protected calls.
- Database connection: verify `DATABASE_URL` and SSL requirement in Neon.
- Swagger not updating: hard refresh the page; confirm `src/config/swagger.ts` and route JSDoc tags.

---

# 15. Admin Dashboard Features

The Farmlingo backend now includes comprehensive admin dashboard functionality with the following features:

## 15.1 Admin Dashboard Overview

Access the admin dashboard at `/admin/dashboard` to get a comprehensive overview of your platform:

- **System Statistics**: Real-time counts of users, courses, lessons, enrollments, forums, chatrooms, and announcements
- **Recent Activity**: Latest user registrations and active announcements
- **System Alerts**: Notifications about inactive announcements and system status
- **Quick Actions**: Direct links to create announcements, manage users, view reports, and check system health

## 15.2 Admin Reports and Analytics

Generate detailed analytics reports at `/admin/reports`:

- **User Growth Analytics**: Monthly user registration trends over the past 12 months
- **Course Popularity**: Top 10 most enrolled courses with enrollment counts
- **Forum Activity**: Most active forums ranked by post count and member engagement

## 15.3 Admin Management Features

The admin panel provides comprehensive management capabilities:

### User Management

- View all users with pagination support
- Suspend/activate user accounts
- Change user roles (student, farmer, admin, super_admin)
- Permanently delete user accounts (super admin only)

### Content Management

- View all courses, lessons, and enrollments
- Monitor forum activity and manage discussions
- View all chatrooms and messages
- Manage announcements with bulk activate/deactivate

### System Monitoring

- System health checks at `/admin/system/health`
- Database connectivity verification
- Service status monitoring

---

# 16. Recent Code Improvements

## 16.1 Authentication Standardization

**Before:**
```typescript
// courses.route.ts
import { authenticate } from '../middlewares/auth';
router.post('/', authenticate, upload.none(), createCourse);

// lessons.route.ts
import { authenticate } from '../middlewares/auth';
router.post('/', authenticate, upload.none(), createLesson);

// Other routes
import { clerkAuth } from '../middlewares/clerk';
router.post('/', clerkAuth, upload.none(), createChatroom);
```

**After:**
```typescript
// All routes now consistently use clerkAuth
import { clerkAuth } from '../middlewares/clerk';
router.post('/', clerkAuth, createCourse);
router.post('/', clerkAuth, createLesson);
router.post('/', clerkAuth, createChatroom);
```

## 16.2 MVC Architecture Implementation

**Before (weather.route.ts):**
```typescript
router.post('/', clerkAuth, async (req: Request, res: Response) => {
    // Business logic directly in route
    const auth = (req as any).auth;
    if (!auth || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    const weatherData: NewWeatherData = req.body;
    const createdWeather = await weatherService.createWeatherData(weatherData);
    res.status(201).json(createdWeather);
});
```

**After (weather.route.ts + weather.controller.ts):**
```typescript
// weather.route.ts - Clean route definition
router.post('/', clerkAuth, requireAdmin, createWeather);

// weather.controller.ts - Business logic
export const createWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const weatherData: NewWeatherData = req.body;
    const createdWeather = await weatherService.createWeatherData(weatherData);
    res.status(201).json(createdWeather);
  } catch (err) {
    next(err as Error);
  }
};
```

## 16.3 Error Handling Standardization

**Before:**
```typescript
// Mixed error handling patterns
catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed' });
}

catch (err) {
    next(err as Error);
}
```

**After:**
```typescript
// Consistent error handling
catch (err) {
    next(err as Error);
}
```

---

# 17. Sequence Diagram

The following sequence diagram visualizes major flows across authentication, courses, forums, chat, reports, and weather data.

![Sequence Diagram](./docs/sequence-diagram.png)

If it does not render in your viewer, open the file directly at [Direct Sequence Diagram Link](https://www.mermaidchart.com/d/3668fe9a-9bf9-4a26-85c9-d106d2e41cf4).

---

# 18. Render Deployment

You can access the Swagger UI for the Farmlingo backend here:
[Open Swagger UI](https://farmlingo-backend-swagger.onrender.com/api-docs/#/)

---

# 19. API Endpoint Summary

## Authentication
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get authenticated user profile

## Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/{courseId}` - Get course details
- `PUT /api/courses/{courseId}` - Update course
- `DELETE /api/courses/{courseId}` - Delete course

## Lessons
- `GET /api/lessons` - List all lessons
- `POST /api/lessons` - Create new lesson
- `GET /api/lessons/{lessonId}` - Get lesson details
- `PUT /api/lessons/{lessonId}` - Update lesson
- `DELETE /api/lessons/{lessonId}` - Delete lesson

## Weather
- `POST /api/weather` - Create weather data (Admin only)
- `GET /api/weather/{weatherId}` - Get weather data by ID
- `GET /api/weather/location/{locationId}` - Get weather by location
- `GET /api/weather/location/{locationId}/latest` - Get latest weather
- `GET /api/weather/location/{locationId}/agricultural` - Get agricultural data
- `GET /api/weather/location/{locationId}/forecast` - Get weather forecast
- `PUT /api/weather/{weatherId}` - Update weather data (Admin only)
- `DELETE /api/weather/{weatherId}` - Delete weather data (Admin only)

## Admin
- `GET /admin/dashboard` - Admin dashboard overview
- `GET /admin/reports` - Admin reports and analytics
- `GET /admin/users` - List all users (Admin only)
- `PUT /admin/users/{userId}/suspend` - Suspend user (Admin only)
- `PUT /admin/users/{userId}/activate` - Activate user (Admin only)
- `PUT /admin/users/{userId}/role` - Change user role (Super Admin only)
- `DELETE /admin/users/{userId}` - Delete user (Super Admin only)

---

# 20. Contribution Guidelines

We welcome contributions to the Farmlingo backend! Please follow these guidelines:

## 20.1 Code Style
- Follow existing code patterns and architecture
- Use TypeScript interfaces for all data structures
- Follow MVC pattern (Routes → Controllers → Services → Repositories)
- Use consistent error handling with `next(err)` pattern

## 20.2 Commit Messages
- Use clear, descriptive commit messages
- Follow conventional commits format: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Reference issues when applicable: `fixes #123`

## 20.3 Pull Requests
- Create PRs from feature branches
- Include detailed description of changes
- Reference related issues
- Ensure all tests pass
- Update documentation as needed

## 20.4 Testing
- Add tests for new features
- Ensure existing tests continue to pass
- Test edge cases and error conditions

---

# 21. Support & Contact

For questions, issues, or support:

- **GitHub Issues**: https://github.com/Farmlingo-Backend/farmlingo-mvp/issues
- **Email**: support@farmlingo.com
- **Documentation**: https://farmlingo-backend-swagger.onrender.com/api-docs/#/

---

**© 2026 Farmlingo. All rights reserved.**
