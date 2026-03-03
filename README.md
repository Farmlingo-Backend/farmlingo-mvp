<<<<<<< HEAD
# Farmlingo Backend API
=======
## Farmlingo Backend (Node.js/TypeScript API)
>>>>>>> 08ae0961282c55c102567829b7a27ed4b0bffc90

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18%2B-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A clean, modular, and scalable Node.js backend API for the Farmlingo platform. This backend provides a solid foundation with routing, middleware, environment configuration, and comprehensive API endpoints for agricultural education and community features.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Farmlingo-HQ/backend-mvp.git
cd backend-mvp

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🛡️ **Security & Authentication**
- JWT-based authentication with Clerk integration
- Role-based access control (Student, Farmer, Admin, Super Admin)
- Input validation and sanitization
- CORS and Helmet security middleware

### 📚 **Core Functionality**
- **User Management**: Registration, authentication, role management
- **Course Management**: Create, manage, and track agricultural courses
- **Lesson System**: Structured learning with progress tracking
- **Enrollment System**: User enrollment in courses with progress monitoring
- **Forum System**: Community discussions and Q&A
- **Chat System**: Real-time communication between users
- **Announcements**: Admin announcements and notifications
- **Weather Integration**: Agricultural weather data and forecasts

### 📊 **Admin Dashboard**
- System statistics and monitoring
- User management and role assignment
- Content moderation and management
- Analytics and reporting
- System health checks

### 🔧 **Developer Experience**
- TypeScript for type safety
- Comprehensive API documentation (Swagger/OpenAPI)
- Modular architecture with clear separation of concerns
- Database migrations with Drizzle ORM
- Comprehensive error handling
- Structured logging

## 🏗️ Architecture

### **MVC Pattern**
```
src/
├── routes/          # API endpoints and routing
├── controllers/     # Business logic handlers
├── services/        # Business logic and data processing
├── repositories/    # Database operations
├── models/          # Data models and schemas
├── middlewares/     # Custom middleware functions
└── config/          # Configuration files
```

### **Technology Stack**
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk + JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (planned)
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## 📦 Installation & Setup

### Prerequisites
- Node.js 16 or later
- npm or yarn
- PostgreSQL database (local or cloud)

### Step 1 — Clone the project
```bash
git clone https://github.com/Farmlingo-HQ/backend-mvp.git
cd backend-mvp
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Configure environment variables
Create a `.env` file in the project root with the following values:

```env
# Database (Neon Serverless)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require

# Auth
JWT_SECRET_KEY="your-super-secret-jwt-key"
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

# External Services
CLERK_SECRET_KEY=your_clerk_secret_key
WEATHER_API_KEY=your_weather_api_key
```

### Step 4 — Set up database
```bash
# Apply database schema
npm run db:push

# Optional: Open Drizzle Studio for database management
npm run db:studio
```

### Step 5 — Run the backend
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The backend will start on the port specified in `.env` (default: **4002**).

**Common URLs:**
- **Root**: http://localhost:4002/
- **Health check**: http://localhost:4002/api/health
- **API Documentation**: http://localhost:4002/api-docs
- **Admin Dashboard**: http://localhost:4002/admin/dashboard

## 📚 API Documentation

### **Swagger UI**
Access the interactive API documentation at:
```
http://localhost:4002/api-docs
```

### **OpenAPI Specification**
Download the API specification:
```
http://localhost:4002/api-docs.json
```

### **Authentication**
All protected endpoints require a valid JWT token in the Authorization header:

```bash
curl -X GET http://localhost:4002/api/courses \
  -H "Authorization: Bearer <your-jwt-token>"
```

### **Example API Calls**

#### User Registration
```bash
curl -X POST http://localhost:4002/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "student"
  }'
```

#### Course Creation
```bash
curl -X POST http://localhost:4002/api/courses \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Introduction to Hydroponics" \
  -F "description=A comprehensive guide to hydroponic farming" \
  -F "category=hydroponics" \
  -F "creator_id=your-user-id"
```

#### Weather Data
```bash
curl -X GET http://localhost:4002/api/weather/location/1/latest \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🗄️ Database Schema

### **Entity Relationship Diagram**
![Database ERD](./docs/erd.svg)

### **Core Entities**
- **Users**: User accounts with role-based permissions
- **Courses**: Educational content with categories
- **Lessons**: Structured learning modules within courses
- **Enrollments**: User enrollment and progress tracking
- **Forums**: Community discussion boards
- **Posts**: User-generated content in forums
- **Chatrooms**: Real-time communication channels
- **Messages**: Chat messages within chatrooms
- **Announcements**: Admin announcements and notifications
- **WeatherData**: Agricultural weather information
- **Quizzes**: Course assessment tools
- **CourseRatings**: User feedback and ratings

### **Database Operations**
```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:migrate

# Open database studio
npm run db:studio
```

## 🛠️ Development

### **Project Structure**
```
backend-mvp/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Database operations
│   ├── middlewares/        # Custom middleware
│   ├── config/             # Configuration files
│   └── types/              # TypeScript type definitions
├── docs/                   # Documentation and diagrams
├── drizzle/                # Database migrations
├── utils/                  # Utility functions
├── uploads/                # File uploads
├── package.json
├── tsconfig.json
└── README.md
```

### **Available Scripts**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test         # Run tests (when available)
npm run db:push      # Apply database schema
npm run db:studio    # Open Drizzle Studio
```

### **Code Style**
- Use TypeScript for type safety
- Follow ESLint configuration
- Use consistent error handling with `next(err)` pattern
- Follow MVC architecture principles
- Use descriptive variable and function names

### **Adding New Features**
1. **Create Database Schema**: Add to `src/db/schema.ts`
2. **Create Repository**: Add database operations in `src/repositories/`
3. **Create Service**: Add business logic in `src/services/`
4. **Create Controller**: Add request handlers in `src/controllers/`
5. **Create Routes**: Add API endpoints in `src/routes/`
6. **Update Documentation**: Add JSDoc comments and update Swagger

## 🧪 Testing

### **Test Structure**
Tests are organized by feature and follow the pattern:
```
__tests__/
├── integration/          # End-to-end API testing
├── unit/                 # Unit tests for services and utilities
├── fixtures/             # Test data and mock objects
└── setup/                # Test configuration and utilities
```

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=user

# Run tests in watch mode (development)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### **Test Database**
Use a separate test database for testing:
```env
TEST_DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/farmlingo_test
```

### **Test Configuration**
- Tests use Jest as the testing framework
- Database operations are mocked for unit tests
- Integration tests use a separate test database
- Test data is managed through fixtures and factories

### **Writing Tests**
```typescript
// Example unit test
describe('UserService', () => {
  it('should create a new user', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = await userService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
  });
});
```

## 🚀 Deployment

### **Environment Variables**
Required environment variables for production:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Authentication
JWT_SECRET_KEY=your-production-jwt-secret
CLERK_SECRET_KEY=your-clerk-secret-key

# Application
NODE_ENV=production
PORT=4002
API_BASE_URL=https://your-domain.com/api

# External Services
WEATHER_API_KEY=your-weather-api-key

# Security
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4002

# Start the application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4002:4002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: farmlingo
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### **Render Deployment**
The application is configured for deployment on Render. To deploy:

1. **Connect your repository** to Render
2. **Set environment variables** in the Render dashboard
3. **Configure build commands**:
   ```bash
   npm install
   npm run build
   ```
4. **Set start command**: `npm start`

### **AWS Deployment**
For AWS deployment using ECS or EC2:

```yaml
# AWS ECS Task Definition
{
  "family": "farmlingo-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "farmlingo-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/farmlingo-backend:latest",
      "portMappings": [
        {
          "containerPort": 4002,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:farmlingo/db-url"
        }
      ]
    }
  ]
}
```

### **Health Checks**
The application provides comprehensive health checks:
- Database connectivity
- External API status
- Cache status
- Message broker status

Access health checks at:
```
GET /api/health
```

### **Monitoring & Logging**
- **Structured logging** with Winston
- **Error tracking** integration ready
- **Performance monitoring** endpoints
- **System metrics** available via health endpoint

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone https://github.com/your-username/backend-mvp.git`
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** following our coding standards
5. **Add tests** for new functionality
6. **Run the test suite**: `npm test`
7. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
8. **Push to the branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request** with a clear description

### **Code Review Process**
- All changes must pass CI/CD checks
- Code must follow TypeScript and ESLint standards
- New features must include tests
- Documentation must be updated
- PRs require at least one approval before merging

### **Code Standards**
- **TypeScript**: Use strict mode and proper type annotations
- **ESLint**: Follow our configuration for consistent code style
- **Naming**: Use descriptive names for variables, functions, and files
- **Comments**: Add JSDoc comments for public APIs and complex logic
- **Error Handling**: Use consistent error handling patterns

### **Feature Development Checklist**
- [ ] Create database schema changes (if needed)
- [ ] Write unit tests for new functionality
- [ ] Write integration tests for API endpoints
- [ ] Update API documentation (Swagger)
- [ ] Add appropriate logging
- [ ] Update README if needed
- [ ] Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 Farmlingo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

We would like to thank the following projects and services that make Farmlingo Backend possible:

- **[Clerk](https://clerk.dev)** - For providing excellent authentication and user management
- **[Drizzle ORM](https://orm.drizzle.team)** - For modern, type-safe database operations
- **[Swagger](https://swagger.io)** - For comprehensive API documentation tools
- **[Neon](https://neon.tech)** - For serverless PostgreSQL hosting
- **[Express.js](https://expressjs.com)** - For the robust web framework foundation
- **[TypeScript](https://www.typescriptlang.org)** - For type safety and developer experience

## 📞 Support

For support and questions:

### **Community Support**
- **GitHub Discussions**: [Join the conversation](https://github.com/Farmlingo-HQ/backend-mvp/discussions)
- **Stack Overflow**: Use the `farmlingo` tag
- **Discord**: [Join our community](https://discord.gg/farmlingo)

### **Professional Support**
- **GitHub Issues**: [Create an issue](https://github.com/Farmlingo-HQ/backend-mvp/issues) for bugs and feature requests
- **Email**: support@farmlingo.com for direct support
- **Documentation**: [API Docs](https://farmlingo-backend-swagger.onrender.com/api-docs)

### **Business Inquiries**
For enterprise support, custom features, or business partnerships:
- **Email**: business@farmlingo.com
- **Website**: [farmlingo.com/contact](https://farmlingo.com/contact)

## 📊 Performance Metrics

### **API Performance Targets**
- **Response Time**: 95% of requests under 200ms
- **Uptime**: 99.9% availability target
- **Concurrent Users**: Support 10,000+ concurrent users
- **Database Queries**: Optimized queries with proper indexing

### **Monitoring Endpoints**
- **Health Check**: `/api/health` - System status
- **Metrics**: `/api/metrics` - Performance metrics (when enabled)
- **System Info**: `/api/system` - Detailed system information

## 🔒 Security

### **Security Features**
- **Authentication**: JWT tokens with Clerk integration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation with Zod
- **Security Headers**: Helmet middleware for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protection against abuse and DDoS

### **Security Best Practices**
- Regular dependency updates and security patches
- Environment variable management for secrets
- Database connection security with SSL
- Input sanitization and validation
- Error handling that doesn't leak sensitive information

## 📝 Changelog

### **v1.0.0** - January 2026
- ✅ **Initial Release**: Complete backend API with all core features
- ✅ **Authentication System**: JWT-based auth with Clerk integration
- ✅ **Database Schema**: Complete PostgreSQL schema with Drizzle ORM
- ✅ **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- ✅ **Admin Dashboard**: Full admin interface with analytics and management
- ✅ **Testing Framework**: Jest-based testing infrastructure
- ✅ **Deployment Ready**: Docker and cloud deployment configurations

### **Recent Improvements**
- 🔧 **Authentication Standardization**: Unified all routes to use `clerkAuth` middleware
- 🏗️ **MVC Architecture**: Implemented proper separation of concerns with controllers
- 🐛 **Error Handling**: Standardized error handling patterns across all endpoints
- 📚 **Documentation**: Enhanced README with comprehensive guides and examples
- 🚀 **Performance**: Optimized database queries and API response times

## 🤔 Frequently Asked Questions

### **Q: How do I set up the development environment?**
A: Follow the [Installation & Setup](#installation--setup) section above. Make sure you have Node.js 16+ and a PostgreSQL database available.

### **Q: What database should I use for development?**
A: We recommend using Neon (serverless PostgreSQL) for cloud development or a local PostgreSQL instance for local development.

### **Q: How do I add a new API endpoint?**
A: Follow our [Adding New Features](#adding-new-features) guide in the Development section. Always follow the MVC pattern and add proper documentation.

### **Q: How do I run tests?**
A: Use `npm test` to run all tests. For development, use `npm run test:watch` to run tests in watch mode.

### **Q: Where can I find the API documentation?**
A: Access the interactive Swagger UI at `http://localhost:4002/api-docs` or download the OpenAPI specification at `http://localhost:4002/api-docs.json`.

### **Q: How do I deploy this application?**
A: We provide deployment guides for Render, Docker, and AWS in the [Deployment](#deployment) section. Choose the platform that best fits your needs.

## 📈 Roadmap

### **Q1 2026**
- [ ] **Mobile App Integration**: Optimize API for mobile client consumption
- [ ] **Advanced Analytics**: Enhanced reporting and dashboard features
- [ ] **Caching Layer**: Implement Redis for improved performance
- [ ] **Background Jobs**: Add job queue for async operations

### **Q2 2026**
- [ ] **Real-time Features**: WebSocket integration for live updates
- [ ] **File Upload**: Enhanced media handling and storage
- [ ] **Search Functionality**: Full-text search across content
- [ ] **API Versioning**: Support for multiple API versions

### **Q3 2026**
- [ ] **Microservices**: Break down monolith into microservices
- [ ] **Advanced Security**: OAuth2, SSO, and enhanced security features
- [ ] **Performance Monitoring**: Advanced APM and monitoring tools
- [ ] **Internationalization**: Multi-language support

---

**© 2026 Farmlingo. All rights reserved.**

**Made with ❤️ by the Farmlingo Team**

[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![Contributors](https://img.shields.io/github/contributors/Farmlingo-HQ/backend-mvp)](https://github.com/Farmlingo-HQ/backend-mvp/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/Farmlingo-HQ/backend-mvp)](https://github.com/Farmlingo-HQ/backend-mvp/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Farmlingo-HQ/backend-mvp/pulls)
[![GitHub license](https://img.shields.io/github/license/Farmlingo-HQ/backend-mvp)](https://github.com/Farmlingo-HQ/backend-mvp/blob/main/LICENSE)
[![Code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
- [ ] Analyze current README structure and content
- [ ] Add badges and visual improvements
- [ ] Create comprehensive table of contents
- [ ] Improve feature documentation with icons and better organization
- [ ] Enhance architecture section with clear diagrams and explanations
- [ ] Improve installation instructions with better formatting
- [ ] Add API documentation section with examples
- [ ] Enhance database schema documentation
- [ ] Add development guidelines and best practices
- [ ] Include testing documentation
- [ ] Add deployment instructions
- [ ] Improve contribution guidelines
- [ ] Add license and acknowledgments sections
- [ ] Review and finalize all improvements
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

<<<<<<< HEAD
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
=======
## 16. Sequence Diagram
>>>>>>> 08ae0961282c55c102567829b7a27ed4b0bffc90

The following sequence diagram visualizes major flows across authentication, courses, forums, chat, reports, and weather data.

![Sequence Diagram](./docs/sequence-diagram.png)

If it does not render in your viewer, open the file directly at [Direct Sequence Diagram Link](https://www.mermaidchart.com/d/3668fe9a-9bf9-4a26-85c9-d106d2e41cf4).

<<<<<<< HEAD
---
=======
## 17. Render Deployment
>>>>>>> 08ae0961282c55c102567829b7a27ed4b0bffc90

# 18. Render Deployment

You can access the Swagger UI for the Farmlingo backend here:
[Open Swagger UI](https://farmlingo-backend-swagger.onrender.com/api-docs/#/)
<<<<<<< HEAD

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
=======
>>>>>>> 08ae0961282c55c102567829b7a27ed4b0bffc90
