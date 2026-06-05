import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

function createDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}

let db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}
