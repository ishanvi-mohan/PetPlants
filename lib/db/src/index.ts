import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Let pg parse the connection string. pg's parser (pg-connection-string)
// correctly percent-decodes the username and password. The WHATWG `URL`
// getters do NOT decode them, so manual parsing passed the still-encoded
// password to pg and the pooler rejected it ("Tenant or user not found").
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
