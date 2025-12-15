import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // load .env values

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts", // point directly to your schema file
  out: "./drizzle",             // folder where migration files will be stored
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Neon connection URL
  },
  migrations: {
    prefix: "timestamp", // good for serverless — keeps migration order safe
  },
});
