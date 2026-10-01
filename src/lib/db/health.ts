import { sql } from "drizzle-orm";
import { getDb } from "./client";

const EXPECTED_TABLES = [
  "properties",
  "units",
  "rooms",
  "hosts",
  "sellers",
  "provisions",
  "rentals",
  "excursions",
  "reviews",
  "booking_requests",
];

/**
 * Which of the expected tables are missing.
 *
 * The health endpoint reports this, because "the database is configured but
 * the migration was never applied" and "the database is unreachable" produce
 * the same 500 at the page level and want completely different fixes.
 */
export async function missingTables(): Promise<string[]> {
  const db = getDb();
  const rows = await db.execute<{ table_name: string }>(
    sql`select table_name from information_schema.tables
        where table_schema = 'public'`,
  );
  const present = new Set(
    (rows as unknown as { table_name: string }[]).map((r) => r.table_name),
  );
  return EXPECTED_TABLES.filter((t) => !present.has(t));
}
