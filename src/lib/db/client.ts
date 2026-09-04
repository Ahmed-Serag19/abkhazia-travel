/**
 * Drizzle client for Supabase Postgres.
 *
 * Use the **connection pooler** URL (port 6543, `?pgbouncer=true`) for
 * serverless on Vercel — the direct 5432 connection runs out of slots under
 * function concurrency. Supabase → Project Settings → Database → Connection
 * string → "Transaction" mode.
 *
 * .env.local:
 *   DATABASE_URL="postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// `prepare: false` is required with the Supabase transaction pooler.
const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : undefined;

export const db = client
  ? drizzle(client, { schema })
  : (undefined as unknown as ReturnType<typeof drizzle>);

export { schema };
