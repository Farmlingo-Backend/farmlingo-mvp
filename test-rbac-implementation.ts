#!/usr/bin/env ts-node

/**
 * Test script for RBAC implementation
 * This script tests the new role-based access control system
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema';
import { rbac } from './src/types/rbac';
import { Role, Module, Action } from './src/types/rbac';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, { schema });

async function testRBACImplementation() {
  console.log('🧪 Testing RBAC Implementation...\n');

  try {
    // Test 1: Verify RBAC permissions matrix
    console.log('1. Testing RBAC Permissions Matrix...');
    testPermissionsMatrix();
    console.log('✅ RBAC permissions matrix test passed\n');

    // Test 2: Test role hierarchy
    console.log('2. Testing Role Hierarchy...');
    testRoleHierarchy();
    console.log('✅ Role hierarchy test passed\n');

    // Test 3: Test institution scope rules
    console.log('3. Testing Institution Scope Rules...');
    testInstitutionScopeRules();
    console.log('✅ Institution scope rules test passed\n');

    // Test 4: Test database schema updates
    console.log('4. Testing Database Schema...');
    await testDatabaseSchema();
    console.log('✅ Database schema test passed\n');

    // Test 5: Test Super Admin account
    console.log('5. Testing Super Admin Account...');
    await testSuperAdminAccount();
    console.log('✅ Super Admin account test passed\n');

    // Test 6: Test RBAC middleware functionality
    console.log('6. Testing RBAC Middleware...');
    testMiddlewareFunctionality();
    console.log('✅ RBAC middleware test passed\n');

    console.log('🎉 All RBAC tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • RBAC permissions matrix is correctly configured');
    console.log('   • Role hierarchy works as expected');
    console.log('   • Institution scope rules are properly implemented');
    console.log('   • Database schema supports new roles and institutions');
    console.log('   • Super Admin account is properly configured');
    console.log('   • RBAC middleware is ready for use');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function testPermissionsMatrix() {
  // Test that all required permissions are defined
  const requiredPermissions = [
    { module: 'auth' as Module, action: 'read' as Action },
    { module: 'user' as Module, action: 'create' as Action },
    { module: 'institution' as Module, action: 'create' as Action },
    { module: 'course' as Module, action: 'create' as Action },
    { module: 'lesson' as Module, action: 'create' as Action },
    { module: 'enrollment' as Module, action: 'enroll' as Action },
    { module: 'quiz' as Module, action: 'start' as Action },
    { module: 'forum' as Module, action: 'create' as Action },
    { module: 'chat' as Module, action: 'create' as Action },
    { module: 'announcement' as Module, action: 'create' as Action },
    { module: 'admin' as Module, action: 'manage' as Action },
    { module: 'system' as Module, action: 'manage' as Action },
  ];

  for (const permission of requiredPermissions) {
    const hasPermission = rbac.hasPermission('super_admin', permission.module, permission.action);
    if (!hasPermission) {
      throw new Error(`Missing permission: super_admin should have ${permission.action} on ${permission.module}`);
    }
  }

  // Test role-specific permissions
  const studentPermissions = [
    { module: 'course' as Module, action: 'enroll' as Action },
    { module: 'quiz' as Module, action: 'start' as Action },
    { module: 'forum' as Module, action: 'create' as Action },
  ];

  for (const permission of studentPermissions) {
    const hasPermission = rbac.hasPermission('student', permission.module, permission.action);
    if (!hasPermission) {
      throw new Error(`Student should have ${permission.action} on ${permission.module}`);
    }
  }

  // Test that students cannot create institutions
  const canCreateInstitution = rbac.hasPermission('student', 'institution' as Module, 'create' as Action);
  if (canCreateInstitution) {
    throw new Error('Students should not be able to create institutions');
  }
}

function testRoleHierarchy() {
  // Test that higher roles inherit permissions from lower roles
  const testCases = [
    { role: 'instructor' as Role, shouldHave: ['student' as Role, 'farmer' as Role] },
    { role: 'institution_admin' as Role, shouldHave: ['instructor' as Role, 'student' as Role, 'farmer' as Role] },
    { role: 'super_admin' as Role, shouldHave: ['institution_admin' as Role, 'instructor' as Role, 'student' as Role, 'farmer' as Role] },
  ];

  for (const testCase of testCases) {
    for (const inheritedRole of testCase.shouldHave) {
      const hasPermission = rbac.hasPermission(testCase.role, 'user' as Module, 'read' as Action);
      const inheritedHasPermission = rbac.hasPermission(inheritedRole, 'user' as Module, 'read' as Action);
      
      if (inheritedHasPermission && !hasPermission) {
        throw new Error(`${testCase.role} should inherit permissions from ${inheritedRole}`);
      }
    }
  }
}

function testInstitutionScopeRules() {
  // Test institution scope rules
  const scopeRules = {
    'student': 'own',
    'farmer': 'own', 
    'instructor': 'own',
    'institution_admin': 'own',
    'super_admin': 'all',
  };

  for (const [role, scope] of Object.entries(scopeRules)) {
    const canAccessResource = rbac.canAccessResource(
      role as Role,
      'user-institution-id',
      'resource-institution-id'
    );

    if (scope === 'own' && role !== 'super_admin') {
      // Users with 'own' scope should only access resources from their own institution
      const canAccessSameInstitution = rbac.canAccessResource(
        role as Role,
        'same-institution-id',
        'same-institution-id'
      );
      const canAccessDifferentInstitution = rbac.canAccessResource(
        role as Role,
        'user-institution-id',
        'different-institution-id'
      );

      if (!canAccessSameInstitution) {
        throw new Error(`${role} should be able to access resources from their own institution`);
      }
      if (canAccessDifferentInstitution) {
        throw new Error(`${role} should not be able to access resources from different institutions`);
      }
    }

    if (scope === 'all') {
      // Super Admin should access all resources
      if (!canAccessResource) {
        throw new Error('Super Admin should be able to access all resources');
      }
    }
  }
}

async function testDatabaseSchema() {
  // Test that the database schema has been updated correctly
  const tables = await db.execute(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('institutions', 'users')
  `);

  if (!tables.rows || tables.rows.length === 0) {
    throw new Error('Required tables not found in database schema');
  }

  // Check if institutions table exists
  const institutionsTable = tables.rows.find(row => row.table_name === 'institutions');
  if (!institutionsTable) {
    throw new Error('Institutions table not found');
  }

  // Check if users table has institution_id column
  const columns = await db.execute(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'institution_id'
  `);

  if (!columns.rows || columns.rows.length === 0) {
    throw new Error('institution_id column not found in users table');
  }
}

async function testSuperAdminAccount() {
  // Test that Super Admin account exists
  const superAdmin = await db.execute(`
    SELECT user_id, email, role, is_active 
    FROM users 
    WHERE email = 'root@farmlingo.com' 
    AND role = 'super_admin'
  `);

  if (!superAdmin.rows || superAdmin.rows.length === 0) {
    throw new Error('Super Admin account not found');
  }

  const admin = superAdmin.rows[0];
  if (!admin.is_active) {
    throw new Error('Super Admin account should be active');
  }

  console.log(`   Super Admin found: ${admin.email} (${admin.user_id})`);
}

function testMiddlewareFunctionality() {
  // Test that middleware functions are properly exported
  const { requirePermission, checkResourceAccess, requireSuperAdmin, requireInstitutionAdmin } = require('./src/middlewares/rbac');

  if (typeof requirePermission !== 'function') {
    throw new Error('requirePermission middleware not found');
  }

  if (typeof checkResourceAccess !== 'function') {
    throw new Error('checkResourceAccess middleware not found');
  }

  if (typeof requireSuperAdmin !== 'function') {
    throw new Error('requireSuperAdmin middleware not found');
  }

  if (typeof requireInstitutionAdmin !== 'function') {
    throw new Error('requireInstitutionAdmin middleware not found');
  }

  console.log('   Middleware functions are properly exported');
}

// Run the tests
if (require.main === module) {
  testRBACImplementation().catch(console.error);
}

export { testRBACImplementation };