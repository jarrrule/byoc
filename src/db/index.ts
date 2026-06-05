import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { getDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

function createDb() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  return drizzle(pool, { schema });
}

let db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}
