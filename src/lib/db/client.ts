/**
 * Drizzle client for Supabase Postgres.
 *
 * Use the **transaction pooler** URL (port 6543) for serverless on Vercel —
 * the direct 5432 connection runs out of slots under function concurrency.
 * Supabase → Project Settings → Database → Connection string → "Transaction".
 *
 * .env.local:
 *   DATABASE_URL="postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:6543/postgres"
 *
 * The connection is built lazily. Importing this module must stay free of
 * side effects: `next build` imports every route to collect its metadata, and
 * a module that opens a socket at import time turns a missing env var into a
 * build failure instead of a runtime one we can degrade from.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // Next dev reloads modules on every edit; without this each reload opens a
  // fresh pool and Supabase starts refusing connections after a few saves.
  var __casacolina_db: { sql: ReturnType<typeof postgres>; db: Database } | undefined;
}

/** Is a database configured at all? Decides whether the app talks to Postgres. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — no database to talk to. " +
        "Either set it, or leave it unset to serve data/content.json.",
    );
  }

  if (globalThis.__casacolina_db) return globalThis.__casacolina_db.db;

  const sql = postgres(url, {
    // Required with the Supabase transaction pooler: prepared statements are
    // per-connection and the pooler hands you a different one each time.
    prepare: false,
    // A serverless function that waits 30s for a connection has already lost
    // the request; fail fast so `error.tsx` can offer a retry.
    connect_timeout: 10,
    idle_timeout: 20,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  });

  const db = drizzle(sql, { schema });
  globalThis.__casacolina_db = { sql, db };
  return db;
}

export { schema };
