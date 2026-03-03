// scripts/create-super-admin.ts
import { db } from '../src/db/dbconfig';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function createSuperAdmin() {
  try {
    const superAdminData = {
      email: 'root@farmlingo.com',
      first_name: 'Root',
      last_name: 'Admin',
      role: 'super_admin' as const,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminData.email))
      .limit(1);

    if (!existing) {
      await db.insert(users).values(superAdminData);
      console.log('Super Admin created successfully');
      console.log('Email: root@farmlingo.com');
      console.log('Role: super_admin');
    } else {
      console.log('Super Admin already exists');
    }
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  }
}

createSuperAdmin().catch(console.error);