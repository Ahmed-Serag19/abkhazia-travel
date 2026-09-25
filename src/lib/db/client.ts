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

  /**
   * Supabase's documented configuration for serverless, plus the one setting
   * their docs warn about and do not set for you.
   * https://supabase.com/docs/guides/database/connecting-to-postgres
   */
  const sql = postgres(url, {
    // Transaction mode has no prepared statements: each query may land on a
    // different backend, and the statement prepared on the last one is gone.
    prepare: false,

    // THE ONE THAT MATTERS. postgres.js pipelines by default — with a query
    // in flight it writes the next one onto the socket without waiting.
    // Supavisor in transaction mode hands the backend back to its pool the
    // moment it sees one reply finish, so a pipelined query is either never
    // answered (the page hangs, no error) or answered with another query's
    // rows. Both happened here: a login that spun for minutes, and a build
    // that died because an excursion came back holding a seller's record.
    //
    // 0 makes a connection "full" after one statement, so concurrent queries
    // queue in the driver instead. Promise.all is safe again. Verified against
    // this database: ten concurrent queries on one connection, which never
    // returned before, now take 550 ms with zero mismatched results.
    max_pipeline: 0,

    // One connection per instance. Supavisor is the pool; a second one here
    // just holds a slot in Supavisor that another instance needed. This is
    // Supabase's recommendation, and it is only safe *because* of the line
    // above — max 1 with pipelining on is the worst possible combination.
    max: Number(process.env.DATABASE_POOL_MAX ?? 1),

    // Refuse to talk to the database unencrypted.
    ssl: "require",

    // A function that waits 30s for a connection has already lost the
    // request; fail fast so error.tsx can offer a retry.
    connect_timeout: 10,
    idle_timeout: 20,
    // `max_pipeline` is read by the driver at runtime (postgres/src/index.js
    // and connection.js) but is missing from the published 3.4.9 type
    // definitions, hence the widening. It is not optional: see above.
  } as postgres.Options<Record<string, never>>);

  const db = drizzle(sql, { schema });
  globalThis.__casacolina_db = { sql, db };
  return db;
}

export { schema };
