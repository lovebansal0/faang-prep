import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Most hosted Postgres (Neon, Supabase, Render) require SSL. Toggle via PGSSL=disable for local.
const ssl = process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false };

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export async function initDb() {
  const fs = await import('node:fs/promises');
  const url = await import('node:url');
  const path = await import('node:path');
  const dir = path.dirname(url.fileURLToPath(import.meta.url));
  const sql = await fs.readFile(path.join(dir, 'schema.sql'), 'utf8');
  await pool.query(sql);
}
