import { Pool } from "pg";
const g = globalThis as unknown as { pgPool?: Pool };
function makePool() {
  const url = process.env.DATABASE_URL;
  return new Pool({
    ...(url ? { connectionString: url } : {}),
    ssl: url && !url.includes("localhost") ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}
export const pool = g.pgPool || makePool();
if (process.env.NODE_ENV !== "production") g.pgPool = pool;
