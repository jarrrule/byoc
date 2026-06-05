export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "Database URL not configured. Set DATABASE_URL or POSTGRES_URL."
    );
  }

  return url;
}
