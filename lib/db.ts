import { Pool } from "pg";
const g = globalThis as unknown as { pgPool?: Pool };
function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada.");
  return new Pool({ connectionString: url, ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false }, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
}
export const pool = g.pgPool || makePool();
if (process.env.NODE_ENV !== "production") g.pgPool = pool;