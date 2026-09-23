/**
 * Apply the schema and the RLS policies to whatever `DATABASE_URL` points at.
 *
 *   npm run db:migrate
 *
 * Why not `drizzle-kit push`: push diffs the live database against the schema
 * and generates whatever DDL it thinks closes the gap, interactively. That is
 * a fine tool on a laptop and a bad one to hand someone as a deploy step — it
 * can decide the closing move is `drop table`. This runs the migration file
 * that is committed to the repo, statement by statement, and nothing else.
 *
 * Re-running is safe: "already exists" is treated as success, because the
 * generated DDL is not written with IF NOT EXISTS and the honest alternative
 * is a migrations table this project is too small to need yet.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---- env --------------------------------------------------------- */

// Next loads .env.local for the app; a plain node script does not get that
// for free, and asking someone to export the variable by hand in PowerShell
// is how the password ends up in their shell history.
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set.\n" +
      "Put it in .env.local — Supabase → Project Settings → Database →\n" +
      "Connection string → Transaction pooler (port 6543).",
  );
  process.exit(1);
}

/* ---- statements -------------------------------------------------- */

const migrationsDir = path.join(root, "drizzle");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No migrations in drizzle/ — run `npx drizzle-kit generate`.");
  process.exit(1);
}

const ALREADY_EXISTS = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (types, constraints)
  "42P06", // duplicate_schema
  "42701", // duplicate_column
]);

const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15 });

let applied = 0;
let skipped = 0;

try {
  for (const file of files) {
    const body = readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = body
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    process.stdout.write(`\n${file} — ${statements.length} statements\n`);

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        applied++;
        process.stdout.write(".");
      } catch (error) {
        if (ALREADY_EXISTS.has(error.code)) {
          skipped++;
          process.stdout.write("=");
          continue;
        }
        process.stdout.write("\n");
        console.error(`\nFailed on:\n${statement}\n`);
        throw error;
      }
    }
    process.stdout.write("\n");
  }

  const policies = path.join(root, "supabase", "policies.sql");
  if (existsSync(policies)) {
    console.log("\nsupabase/policies.sql — row level security");
    const result = await sql.unsafe(readFileSync(policies, "utf8"));
    // The file ends with a self-check select; print it, because "which tables
    // are still exposed" is the one thing worth reading from this run.
    const rows = Array.isArray(result) ? result.at(-1) : null;
    if (Array.isArray(rows)) {
      for (const row of rows) {
        const flag = row.rls_enabled ? "  on" : " OFF";
        console.log(
          `  ${flag}  ${String(row.table_name).padEnd(18)} ${row.policies} policies`,
        );
      }
    }
  }

  console.log(
    `\nDone. ${applied} statements applied, ${skipped} already in place.`,
  );
} catch (error) {
  console.error("\nMigration failed:", error.message);
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    console.error(
      "Could not reach the host. Check the project is not paused and that\n" +
        "you used the pooler host (…pooler.supabase.com:6543).",
    );
  }
  if (error.code === "28P01") {
    console.error("Password rejected — re-copy the connection string.");
  }
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
