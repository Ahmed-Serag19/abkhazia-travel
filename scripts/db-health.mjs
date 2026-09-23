/**
 * What is this deployment actually serving?
 *
 *   npm run db:health                     # local dev server
 *   npm run db:health -- https://<site>   # the deployed one
 *
 * Prints the answer to the four questions that look identical from a browser:
 * is a database configured, can it be reached, does it have the schema, and
 * does it have any content in it.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.ADMIN_API_SECRET;

if (!secret) {
  console.error("ADMIN_API_SECRET is not set in .env.local.");
  process.exit(1);
}

let response;
try {
  response = await fetch(`${base}/api/admin/health`, {
    headers: { authorization: `Bearer ${secret}` },
  });
} catch (error) {
  console.error(`Could not reach ${base}: ${error.message}`);
  process.exit(1);
}

const body = await response.json().catch(() => null);

if (!response.ok) {
  console.error(`${response.status}: ${body?.message ?? "no detail"}`);
  process.exit(1);
}

const { database, content } = body;

console.log(`\n${base}\n`);
console.log(`  serving        ${database.serving}${database.override ? "  (DATA_SOURCE override)" : ""}`);
console.log(`  DATABASE_URL   ${database.configured ? "set" : "not set"}`);

if (database.configured) {
  console.log(
    `  reachable      ${database.reachable ? `yes (${database.latencyMs} ms)` : `NO — ${database.error}`}`,
  );
  if (database.reachable) {
    console.log(
      `  schema         ${
        database.schemaApplied
          ? "applied"
          : `MISSING ${database.missingTables.join(", ")}  → npm run db:migrate`
      }`,
    );
  }
}

console.log("");
if (content.error) {
  console.log(`  content read FAILED: ${content.error}`);
} else {
  for (const [key, value] of Object.entries(content)) {
    const warn = value === 0 ? "   ← empty, run npm run db:seed" : "";
    console.log(`  ${String(value).padStart(4)}  ${key}${warn}`);
  }
}
console.log("");
