# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the comprehensive RBAC implementation for the Farmlingo platform, which introduces a hierarchical role system with Super Admin, Institution Admin, Instructor, Student, and Farmer roles, along with institution-based access control.

## Architecture

### 1. Role Hierarchy

The system implements a hierarchical role structure where higher roles inherit permissions from lower roles:

```
Super Admin (root@farmlingo.com)
├── Institution Admin
    ├── Instructor
        ├── Student
        └── Farmer
```

### 2. Role Definitions

- **Super Admin**: Full platform access, can manage all institutions and users
- **Institution Admin**: Manages their own institution, users, and resources
- **Instructor**: Creates and manages courses, lessons, and quizzes within their institution
- **Student/Farmer**: Learners who can enroll in courses and participate in forums

### 3. Institution-Based Access Control

Each user belongs to an institution (except Super Admin), and access is scoped based on institution boundaries:

- **Super Admin**: Can access all resources across all institutions
- **Other Roles**: Can only access resources within their own institution

## Database Schema Updates

### New Tables

#### `institutions` Table
```sql
CREATE TABLE institutions (
  institution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  description TEXT,
  logo_url VARCHAR(1000),
  email_domain VARCHAR(128),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);
```

#### Updated `users` Table
```sql
ALTER TABLE users ADD COLUMN institution_id UUID;
ALTER TABLE users ADD CONSTRAINT fk_users_institution_id 
  FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL;
```

### New Roles in Enum

```sql
ALTER TYPE roles ADD VALUE IF NOT EXISTS 'instructor';
ALTER TYPE roles ADD VALUE IF NOT EXISTS 'institution_admin';
```

## RBAC System Components

### 1. Core Types (`src/types/rbac.ts`)

#### Role Types
```typescript
export type Role = 'student' | 'farmer' | 'instructor' | 'institution_admin' | 'super_admin';
```

#### Module and Action Types
```typescript
export type Module = 'auth' | 'user' | 'institution' | 'course' | 'lesson' | 'enrollment' | 'quiz' | 'forum' | 'chat' | 'announcement' | 'admin' | 'system';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'list' | 'enroll' | 'manage' | 'start' | 'submit';
```

#### Permission Matrix
The system defines a comprehensive permissions matrix that specifies which roles can perform which actions on which modules.

### 2. RBAC Middleware (`src/middlewares/rbac.ts`)

#### Core Middleware Functions

- **`requirePermission(options)`**: Enforces module-level permissions
- **`checkResourceAccess(getResourceInstitutionId)`**: Validates institution scope
- **`requireSuperAdmin()`**: Restricts access to Super Admin only
- **`requireInstitutionAdmin()`**: Restricts access to Institution Admin + Super Admin
- **`requireInstructor()`**: Restricts access to Instructor + Institution Admin + Super Admin
- **`requireLearner()`**: Restricts access to Student + Farmer

#### Usage Examples

```typescript
// Protect an endpoint with RBAC
router.get('/courses', 
  requirePermission({ module: 'course', action: 'list' }),
  checkResourceAccess((req) => req.params.institutionId),
  getCourses
);

// Restrict to specific roles
router.post('/institutions', 
  requireSuperAdmin,
  createInstitution
);
```

### 3. Enhanced Auth Middleware (`src/middlewares/auth.ts`)

Updated the existing auth middleware to work with the new RBAC system and include institution information in the auth context.

## API Endpoints

### New Admin Endpoints

#### Institution Management (Super Admin Only)
- `GET /admin/institutions` - List all institutions
- `POST /admin/institutions` - Create new institution
- `PUT /admin/institutions/:id` - Update institution
- `DELETE /admin/institutions/:id` - Delete institution

#### User Management (Super Admin Only)
- `GET /admin/users` - List all users across platform
- `PUT /admin/users/:id/promote` - Promote user to Institution Admin
- `PUT /admin/users/:id/demote` - Demote Institution Admin to Instructor

#### Institution-Specific User Management (Institution Admin + Super Admin)
- `GET /admin/institutions/:id/users` - List users in specific institution

#### Platform Statistics (Super Admin Only)
- `GET /admin/dashboard` - Get platform-wide statistics

### Existing Endpoints with RBAC

All existing admin endpoints now use the new RBAC system with appropriate role restrictions.

## Migration and Setup

### Database Migration

Run the migration script to update the database schema:

```sql
-- Execute the migration file
\i drizzle/20260302123000_create_institutions_and_update_users.sql
```

### Super Admin Account

A Super Admin account is automatically created with:
- **Email**: `root@farmlingo.com`
- **Role**: `super_admin`
- **Password**: Set through your authentication provider (Clerk)

### Environment Variables

Ensure your `.env` file includes the database connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/farmlingo?sslmode=prefer"
```

## Testing

### Test Script

Run the comprehensive test suite to verify the RBAC implementation:

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the test script
ts-node test-rbac-implementation.ts
```

### Test Coverage

The test script verifies:
1. RBAC permissions matrix configuration
2. Role hierarchy inheritance
3. Institution scope rules
4. Database schema updates
5. Super Admin account creation
6. Middleware functionality

## Security Considerations

### 1. Principle of Least Privilege

- Users only have access to the minimum resources needed for their role
- Institution Admins cannot access other institutions' data
- Students/Farmers have read-only access to most resources

### 2. Data Isolation

- Institution data is isolated by design
- Users can only access resources within their institution
- Super Admin has explicit access to override isolation when needed

### 3. Audit Trail

- All admin actions are logged through existing middleware
- Database operations maintain audit trails
- User role changes are tracked

### 4. Input Validation

- All endpoints include proper input validation
- UUID validation for resource identifiers
- Rate limiting on admin endpoints

## Usage Examples

### Creating a New Institution

```bash
curl -X POST http://localhost:3000/admin/institutions \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "University of Agriculture",
    "description": "A leading agricultural university",
    "logoUrl": "https://example.com/logo.png",
    "emailDomain": "agri.edu"
  }'
```

### Promoting a User to Institution Admin

```bash
curl -X PUT http://localhost:3000/admin/users/123e4567-e89b-12d3-a456-426614174000/promote \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json"
```

### Getting Platform Statistics

```bash
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer <super_admin_token>"
```

## Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:

- **401**: Authentication required
- **403**: Insufficient permissions or access denied
- **400**: Invalid input data
- **404**: Resource not found
- **500**: Internal server error

## Future Enhancements

### Planned Features

1. **Role Assignment API**: Allow Institution Admins to assign roles within their institution
2. **Permission Groups**: Create custom permission groups for specialized roles
3. **Audit Logs**: Enhanced logging for all RBAC-related operations
4. **Multi-Tenancy**: Full multi-tenancy support with separate database schemas per institution

### Extension Points

The RBAC system is designed to be easily extensible:

- New roles can be added to the `Role` type and hierarchy
- New modules and actions can be defined in the permissions matrix
- Custom middleware can be created for specialized access patterns

## Troubleshooting

### Common Issues

1. **"Super admin access required"**: Ensure you're using a Super Admin account token
2. **"Access denied: Cannot access resources from different institution"**: Verify the user belongs to the correct institution
3. **"User not found"**: Check that the user exists and is active
4. **Database connection errors**: Verify your DATABASE_URL is correct

### Debug Mode

Enable debug logging to troubleshoot RBAC issues:

```typescript
// Add to your application startup
process.env.DEBUG = 'rbac:*';
```

## Conclusion

This RBAC implementation provides a robust, scalable, and secure foundation for managing user access in the Farmlingo platform. The hierarchical role system with institution-based access control ensures proper data isolation while maintaining flexibility for platform administration.

The system is designed to be maintainable and extensible, with comprehensive testing and clear documentation to support ongoing development and operation.