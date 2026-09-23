/**
 * Import data/content.json into the database.
 *
 *   npm run db:seed                          # against the local dev server
 *   npm run db:seed -- https://<site>        # against the deployed one
 *
 * It calls `POST /api/admin/seed` rather than talking to Postgres directly,
 * so there is exactly one implementation of the content → rows mapping (in
 * `src/lib/db/seed.ts`, typed against the same domain model the site uses)
 * instead of a second untyped copy living in this script and drifting.
 *
 * The cost is that something has to be serving the app. Locally that is
 * `npm run dev`; in production it is the deployment itself, which is the
 * right way round — re-importing content after a deploy should not require a
 * laptop with the database password on it.
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
  console.error(
    "ADMIN_API_SECRET is not set in .env.local.\n" +
      "Generate one:  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );
  process.exit(1);
}

console.log(`Seeding ${base} from data/content.json …`);

let response;
try {
  response = await fetch(`${base}/api/admin/seed`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
} catch (error) {
  console.error(`Could not reach ${base}: ${error.message}`);
  console.error("Is the server running? (npm run dev)");
  process.exit(1);
}

const body = await response.json().catch(() => null);

if (!response.ok) {
  console.error(`\n${response.status} ${body?.error ?? ""}: ${body?.message ?? "no detail"}`);
  if (body?.reference) console.error(`Server log reference: ${body.reference}`);
  process.exit(1);
}

const { imported, contentUpdatedAt } = body;
console.log(`\nImported (content.json last edited ${contentUpdatedAt}):`);
for (const [table, count] of Object.entries(imported)) {
  console.log(`  ${String(count).padStart(4)}  ${table}`);
}
