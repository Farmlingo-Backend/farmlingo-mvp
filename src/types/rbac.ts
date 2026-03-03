// src/types/rbac.ts

/**
 * RBAC (Role-Based Access Control) Types and Permissions
 */

export type Role = 'student' | 'farmer' | 'instructor' | 'institution_admin' | 'super_admin';

export type Module = 
  | 'auth'
  | 'user'
  | 'institution'
  | 'course'
  | 'lesson'
  | 'enrollment'
  | 'quiz'
  | 'forum'
  | 'chat'
  | 'announcement'
  | 'admin'
  | 'system';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'list' | 'enroll' | 'manage' | 'start' | 'submit';

export interface Permission {
  module: Module;
  action: Action;
  allowedRoles: Role[];
}

export interface AuthContext {
  userId: string;
  role: Role;
  institutionId?: string | null;
  email: string;
  clerkUserId?: string | null;
}

export interface RBACConfig {
  permissions: Permission[];
}

/**
 * RBAC Permissions Matrix
 * Defines what actions each role can perform on each module
 */
export const RBAC_PERMISSIONS: Permission[] = [
  // Auth Module
  { module: 'auth', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'auth', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  
  // User Module
  { module: 'user', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'user', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'user', action: 'list', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'user', action: 'create', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'user', action: 'delete', allowedRoles: ['super_admin'] },
  { module: 'user', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Institution Module
  { module: 'institution', action: 'read', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'institution', action: 'create', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'update', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'delete', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'list', allowedRoles: ['super_admin'] },
  
  // Course Module
  { module: 'course', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'list', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'delete', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'course', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'enroll', allowedRoles: ['student', 'farmer'] },
  
  // Lesson Module
  { module: 'lesson', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Enrollment Module
  { module: 'enrollment', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'enrollment', action: 'create', allowedRoles: ['student', 'farmer'] },
  { module: 'enrollment', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'enrollment', action: 'delete', allowedRoles: ['student', 'farmer'] },
  { module: 'enrollment', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Quiz Module
  { module: 'quiz', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'start', allowedRoles: ['student', 'farmer'] },
  { module: 'quiz', action: 'submit', allowedRoles: ['student', 'farmer'] },
  
  // Forum Module
  { module: 'forum', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'create', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'delete', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Chat Module
  { module: 'chat', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'create', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'delete', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Announcement Module
  { module: 'announcement', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'create', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'update', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'delete', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Admin Module
  { module: 'admin', action: 'read', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'admin', action: 'create', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'update', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'delete', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'manage', allowedRoles: ['super_admin'] },
  
  // System Module
  { module: 'system', action: 'read', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'manage', allowedRoles: ['super_admin'] },
];

/**
 * Role hierarchy for inheritance
 * Higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  'student': ['student'],
  'farmer': ['farmer'],
  'instructor': ['instructor', 'student', 'farmer'],
  'institution_admin': ['institution_admin', 'instructor', 'student', 'farmer'],
  'super_admin': ['super_admin', 'institution_admin', 'instructor', 'student', 'farmer'],
};

/**
 * Institution scope rules
 * Defines which roles can access which institution data
 */
export const INSTITUTION_SCOPE_RULES: Record<Role, 'own' | 'all' | 'none'> = {
  'student': 'own',
  'farmer': 'own',
  'instructor': 'own',
  'institution_admin': 'own',
  'super_admin': 'all',
};

/**
 * Helper functions for RBAC
 */
export class RBAC {
  private permissions: Permission[];

  constructor(config: RBACConfig) {
    this.permissions = config.permissions;
  }

  /**
   * Check if a role has permission for a specific action on a module
   */
  hasPermission(role: Role, module: Module, action: Action): boolean {
    const roleHierarchy = ROLE_HIERARCHY[role] || [];
    
    for (const roleInHierarchy of roleHierarchy) {
      const permission = this.permissions.find(
        p => p.module === module && p.action === action && p.allowedRoles.includes(roleInHierarchy)
      );
      
      if (permission) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if a user can access a resource based on institution scope
   */
  canAccessResource(userRole: Role, userInstitutionId: string | null | undefined, resourceInstitutionId: string | null | undefined): boolean {
    const scopeRule = INSTITUTION_SCOPE_RULES[userRole];
    
    switch (scopeRule) {
      case 'none':
        return false;
      case 'own':
        // Users can only access resources from their own institution
        // Super Admin can access all resources (resourceInstitutionId can be null)
        return userInstitutionId === resourceInstitutionId || userRole === 'super_admin';
      case 'all':
        // Super Admin can access all resources
        return true;
      default:
        return false;
    }
  }

  /**
   * Get all permissions for a role
   */
  getPermissionsForRole(role: Role): Permission[] {
    const roleHierarchy = ROLE_HIERARCHY[role] || [];
    return this.permissions.filter(p => 
      p.allowedRoles.some(allowedRole => roleHierarchy.includes(allowedRole))
    );
  }

  /**
   * Check if a role can perform any action on a module
   */
  canAccessModule(role: Role, module: Module): boolean {
    return this.getPermissionsForRole(role)
      .some(permission => permission.module === module);
  }
}

/**
 * Default RBAC instance
 */
export const rbac = new RBAC({
  permissions: RBAC_PERMISSIONS
});

/**
 * Middleware helper types
 */
export interface RBACMiddlewareOptions {
  module: Module;
  action: Action;
  requireInstitutionAccess?: boolean;
}

/**
 * Error types for RBAC
 */
export class RBACError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'RBACError';
  }
}

export class InsufficientPermissionsError extends RBACError {
  constructor(module: Module, action: Action, role: Role) {
    super(`Insufficient permissions: ${role} cannot ${action} ${module}`);
    this.statusCode = 403;
  }
}

export class InstitutionAccessError extends RBACError {
  constructor() {
    super('Access denied: Cannot access resources from different institution');
    this.statusCode = 403;
  }
}