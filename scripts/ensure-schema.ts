import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error("Database URL not configured");
  }

  return url;
}

async function ensureSchema() {
  const sql = neon(getDatabaseUrl());

  await sql`
    CREATE TABLE IF NOT EXISTS parties (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      date date,
      location text DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS party_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
      name text NOT NULL,
      unit text DEFAULT '',
      quantity_needed integer NOT NULL DEFAULT 1,
      quantity_claimed integer NOT NULL DEFAULT 0
    )
  `;

  await sql`ALTER TABLE party_items ADD COLUMN IF NOT EXISTS unit text DEFAULT ''`;
  await sql`ALTER TABLE party_items ADD COLUMN IF NOT EXISTS quantity_needed integer NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE party_items ADD COLUMN IF NOT EXISTS quantity_claimed integer NOT NULL DEFAULT 0`;

  await sql`ALTER TABLE party_items DROP COLUMN IF EXISTS quantity`;
  await sql`ALTER TABLE party_items DROP COLUMN IF EXISTS claimed_by`;
  await sql`ALTER TABLE party_items DROP COLUMN IF EXISTS claimed_at`;

  await sql`
    CREATE TABLE IF NOT EXISTS party_claims (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
      item_id uuid NOT NULL REFERENCES party_items(id) ON DELETE CASCADE,
      guest_name text NOT NULL,
      quantity integer NOT NULL,
      claimed_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT party_claims_item_guest_unique UNIQUE (item_id, guest_name)
    )
  `;

  console.log("Database schema is up to date.");
}

ensureSchema().catch((error) => {
  console.error("Schema migration failed:", error);
  process.exit(1);
});
