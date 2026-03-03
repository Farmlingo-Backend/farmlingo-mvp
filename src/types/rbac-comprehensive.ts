// src/types/rbac-comprehensive.ts

/**
 * Comprehensive RBAC (Role-Based Access Control) Types and Permissions
 * This file contains the complete permissions matrix for all modules and features
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
  | 'marketplace'
  | 'material'
  | 'admin'
  | 'system';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'list' | 'enroll' | 'manage' | 'start' | 'submit' | 'purchase' | 'download' | 'stream' | 'promote' | 'demote' | 'publish' | 'unpublish' | 'progress' | 'complete' | 'grade' | 'moderate' | 'pin' | 'lock' | 'ban' | 'unban' | 'schedule' | 'approve' | 'reject' | 'view_sales' | 'upload' | 'organize' | 'analytics' | 'reports' | 'settings' | 'health' | 'logs' | 'backup' | 'restore';

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
 * Comprehensive RBAC Permissions Matrix
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
  { module: 'user', action: 'promote', allowedRoles: ['super_admin'] },
  { module: 'user', action: 'demote', allowedRoles: ['super_admin'] },
  
  // Institution Module
  { module: 'institution', action: 'read', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'institution', action: 'create', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'update', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'delete', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'list', allowedRoles: ['super_admin'] },
  { module: 'institution', action: 'manage', allowedRoles: ['super_admin'] },
  
  // Course Module
  { module: 'course', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'list', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'delete', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'course', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'course', action: 'enroll', allowedRoles: ['student', 'farmer'] },
  { module: 'course', action: 'publish', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'course', action: 'unpublish', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Lesson Module
  { module: 'lesson', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'publish', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'lesson', action: 'unpublish', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Enrollment Module
  { module: 'enrollment', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'enrollment', action: 'create', allowedRoles: ['student', 'farmer'] },
  { module: 'enrollment', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'enrollment', action: 'delete', allowedRoles: ['student', 'farmer'] },
  { module: 'enrollment', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'enrollment', action: 'progress', allowedRoles: ['student', 'farmer'] },
  { module: 'enrollment', action: 'complete', allowedRoles: ['student', 'farmer'] },
  
  // Quiz Module
  { module: 'quiz', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'manage', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'quiz', action: 'start', allowedRoles: ['student', 'farmer'] },
  { module: 'quiz', action: 'submit', allowedRoles: ['student', 'farmer'] },
  { module: 'quiz', action: 'grade', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Forum Module
  { module: 'forum', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'create', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'delete', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'forum', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'forum', action: 'moderate', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'forum', action: 'pin', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'forum', action: 'lock', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Chat Module
  { module: 'chat', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'create', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'update', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'delete', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'chat', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'chat', action: 'moderate', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'chat', action: 'ban', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'chat', action: 'unban', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Announcement Module
  { module: 'announcement', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'create', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'update', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'delete', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'schedule', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'announcement', action: 'publish', allowedRoles: ['institution_admin', 'super_admin'] },
  
  // Marketplace Module
  { module: 'marketplace', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'list', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'marketplace', action: 'purchase', allowedRoles: ['student', 'farmer'] },
  { module: 'marketplace', action: 'approve', allowedRoles: ['super_admin'] },
  { module: 'marketplace', action: 'reject', allowedRoles: ['super_admin'] },
  { module: 'marketplace', action: 'view_sales', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Material Module
  { module: 'material', action: 'read', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'list', allowedRoles: ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'create', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'update', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'delete', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'manage', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'material', action: 'upload', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  { module: 'material', action: 'download', allowedRoles: ['student', 'farmer'] },
  { module: 'material', action: 'stream', allowedRoles: ['student', 'farmer'] },
  { module: 'material', action: 'organize', allowedRoles: ['instructor', 'institution_admin', 'super_admin'] },
  
  // Admin Module
  { module: 'admin', action: 'read', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'admin', action: 'create', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'update', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'delete', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'manage', allowedRoles: ['super_admin'] },
  { module: 'admin', action: 'analytics', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'admin', action: 'reports', allowedRoles: ['institution_admin', 'super_admin'] },
  { module: 'admin', action: 'settings', allowedRoles: ['super_admin'] },
  
  // System Module
  { module: 'system', action: 'read', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'manage', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'health', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'logs', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'backup', allowedRoles: ['super_admin'] },
  { module: 'system', action: 'restore', allowedRoles: ['super_admin'] },
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
 * Module descriptions for documentation
 */
export const MODULE_DESCRIPTIONS: Record<Module, string> = {
  'auth': 'Authentication and authorization operations',
  'user': 'User management and profile operations',
  'institution': 'Institution management and settings',
  'course': 'Course creation, management, and enrollment',
  'lesson': 'Lesson content and media management',
  'enrollment': 'Course enrollment and progress tracking',
  'quiz': 'Quiz creation, management, and grading',
  'forum': 'Discussion forums and community posts',
  'chat': 'Real-time chat and messaging',
  'announcement': 'Platform and institution announcements',
  'marketplace': 'Product listings and purchase system',
  'material': 'Learning materials and resources',
  'admin': 'Administrative operations and management',
  'system': 'System-level operations and monitoring',
};

/**
 * Action descriptions for documentation
 */
export const ACTION_DESCRIPTIONS: Record<Action, string> = {
  'create': 'Create new resources',
  'read': 'View/read resources',
  'update': 'Modify existing resources',
  'delete': 'Remove resources',
  'list': 'List multiple resources',
  'enroll': 'Enroll in courses',
  'manage': 'Full management access',
  'start': 'Begin quizzes or assessments',
  'submit': 'Submit quiz answers or assignments',
  'purchase': 'Buy marketplace items',
  'download': 'Download files and materials',
  'stream': 'Stream media content',
  'promote': 'Promote users to higher roles',
  'demote': 'Demote users to lower roles',
  'publish': 'Publish content to public',
  'unpublish': 'Remove content from public view',
  'progress': 'Track progress in courses or lessons',
  'complete': 'Mark resources as completed',
  'grade': 'Grade assignments or quizzes',
  'moderate': 'Moderate community content',
  'pin': 'Pin important posts or announcements',
  'lock': 'Lock discussions or content',
  'ban': 'Ban users from community features',
  'unban': 'Remove user bans',
  'schedule': 'Schedule content for future publication',
  'approve': 'Approve content or listings',
  'reject': 'Reject content or listings',
  'view_sales': 'View sales and revenue reports',
  'upload': 'Upload files and media',
  'organize': 'Organize and categorize content',
  'analytics': 'View analytics and statistics',
  'reports': 'Generate and view reports',
  'settings': 'Modify system settings',
  'health': 'Check system health status',
  'logs': 'View system logs and audit trails',
  'backup': 'Create system backups',
  'restore': 'Restore from backups',
};

/**
 * Helper functions for RBAC
 */
export class RBAC {
  public permissions: Permission[];

  constructor(config: RBACConfig) {
    this.permissions = config.permissions || [];
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

  /**
   * Get all modules a role can access
   */
  getAccessibleModules(role: Role): Module[] {
    return Array.from(new Set(
      this.getPermissionsForRole(role).map(p => p.module)
    ));
  }

  /**
   * Get all actions a role can perform on a module
   */
  getActionsForRoleAndModule(role: Role, module: Module): Action[] {
    return this.getPermissionsForRole(role)
      .filter(p => p.module === module)
      .map(p => p.action);
  }

  /**
   * Validate if a user can perform an action on a resource
   */
  canPerformAction(
    userRole: Role, 
    userInstitutionId: string | null | undefined,
    module: Module, 
    action: Action,
    resourceInstitutionId?: string | null
  ): boolean {
    // Check basic permission
    if (!this.hasPermission(userRole, module, action)) {
      return false;
    }

    // Check institution scope if required
    if (resourceInstitutionId !== undefined) {
      return this.canAccessResource(userRole, userInstitutionId, resourceInstitutionId);
    }

    return true;
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
  getResourceInstitutionId?: (req: any) => string | null | undefined;
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

export class InvalidRoleError extends RBACError {
  constructor(role: string) {
    super(`Invalid role: ${role}`);
    this.statusCode = 400;
  }
}

export class ModuleNotFoundError extends RBACError {
  constructor(module: Module) {
    super(`Module not found: ${module}`);
    this.statusCode = 404;
  }
}

export class ActionNotFoundError extends RBACError {
  constructor(action: Action) {
    super(`Action not found: ${action}`);
    this.statusCode = 404;
  }
}

/**
 * Utility functions for common RBAC operations
 */
export const rbacUtils = {
  /**
   * Check if a role is valid
   */
  isValidRole(role: string): role is Role {
    return ['student', 'farmer', 'instructor', 'institution_admin', 'super_admin'].includes(role);
  },

  /**
   * Check if a module is valid
   */
  isValidModule(module: string): module is Module {
    return ['auth', 'user', 'institution', 'course', 'lesson', 'enrollment', 'quiz', 'forum', 'chat', 'announcement', 'marketplace', 'material', 'admin', 'system'].includes(module);
  },

  /**
   * Check if an action is valid
   */
  isValidAction(action: string): action is Action {
    return ['create', 'read', 'update', 'delete', 'list', 'enroll', 'manage', 'start', 'submit', 'purchase', 'download', 'stream', 'moderate', 'publish', 'unpublish', 'grade', 'pin', 'lock', 'ban', 'unban', 'schedule', 'approve', 'reject', 'view_sales', 'upload', 'organize', 'analytics', 'reports', 'settings', 'health', 'logs', 'backup', 'restore'].includes(action);
  },

  /**
   * Get role hierarchy level (higher number = more privileges)
   */
  getRoleLevel(role: Role): number {
    const levels = {
      'student': 1,
      'farmer': 1,
      'instructor': 2,
      'institution_admin': 3,
      'super_admin': 4
    };
    return levels[role] || 0;
  },

  /**
   * Check if role A has higher or equal privileges than role B
   */
  hasEqualOrHigherPrivileges(roleA: Role, roleB: Role): boolean {
    return this.getRoleLevel(roleA) >= this.getRoleLevel(roleB);
  },

  /**
   * Get all roles that can perform a specific action on a module
   */
  getRolesWithPermission(module: Module, action: Action): Role[] {
    const permission = rbac.permissions.find(p => p.module === module && p.action === action);
    return permission ? permission.allowedRoles : [];
  },

  /**
   * Check if a role can manage another role
   */
  canManageRole(managerRole: Role, targetRole: Role): boolean {
    // Super Admin can manage all roles
    if (managerRole === 'super_admin') return true;
    
    // Institution Admin can manage instructors, students, and farmers
    if (managerRole === 'institution_admin') {
      return ['instructor', 'student', 'farmer'].includes(targetRole);
    }
    
    // Instructors can only manage students and farmers in some contexts
    if (managerRole === 'instructor') {
      return ['student', 'farmer'].includes(targetRole);
    }
    
    // Students and farmers cannot manage other roles
    return false;
  }
};