import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function test() {
  try {
    await db.execute("SELECT 1");
    console.log("DB OK");
  } catch (e) {
    console.error("DB ERROR:", e);
  }
}

test();
