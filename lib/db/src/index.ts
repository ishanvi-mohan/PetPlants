import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse URL manually so pg receives the decoded password directly
// (avoids issues with special chars in URL-encoded passwords)
const dbUrl = new URL(process.env.DATABASE_URL);
export const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port ? parseInt(dbUrl.port) : 5432,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ""),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
