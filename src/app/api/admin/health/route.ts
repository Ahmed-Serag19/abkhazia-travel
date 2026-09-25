/**
 * GET /api/admin/health
 *
 * One call that answers "why is the site showing the wrong thing?".
 *
 * The failure modes it separates, which all look identical from a page:
 *   - no database configured at all (serving the JSON file, probably fine)
 *   - configured but unreachable (wrong password, paused project, no pooler)
 *   - reachable but the schema was never applied
 *   - schema applied but never seeded (empty tables, site renders nothing)
 *
 * Authenticated, because the shape of your infrastructure is not public.
 */

import { adminAuthMessage, authorizeAdmin } from "@/lib/admin-auth";
import { fail, ok, route } from "@/lib/api";
import { getServerData } from "@/lib/data";
import { hasDatabase } from "@/lib/db/client";
import { missingTables } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export const GET = route("admin.health.GET", async (req: Request) => {
  const auth = authorizeAdmin(req);
  if (!auth.ok) return fail("unauthorized", adminAuthMessage(auth.reason));

  const configured = hasDatabase();
  const database: Record<string, unknown> = {
    configured,
    override: process.env.DATA_SOURCE ?? null,
    serving: configured && !process.env.DATA_SOURCE ? "db" : (process.env.DATA_SOURCE ?? "json"),
  };

  if (configured) {
    const started = Date.now();
    try {
      const absent = await missingTables();
      database.reachable = true;
      database.latencyMs = Date.now() - started;
      database.missingTables = absent;
      database.schemaApplied = absent.length === 0;
    } catch (error) {
      // Deliberately caught rather than thrown: an unreachable database is
      // precisely what this endpoint exists to report. A 500 here would tell
      // the caller nothing they did not already know.
      database.reachable = false;
      database.error =
        error instanceof Error ? error.message : "unknown connection failure";
    }
  }

  // Counts come through the same DataSource the pages use, so this reports
  // what a visitor would actually be served, not what is in some table.
  let content: Record<string, number> | { error: string };
  try {
    const data = getServerData();
    const properties = await data.listProperties();
    const rentals = await data.listRentals();
    const excursions = await data.listExcursions();
    const provisions = await data.listProvisions();
    const sellers = await data.listSellers();
    content = {
      properties: properties.length,
      rentals: rentals.length,
      excursions: excursions.length,
      provisions: provisions.length,
      sellers: sellers.length,
    };
  } catch (error) {
    content = {
      error: error instanceof Error ? error.message : "read failed",
    };
  }

  return ok({ ok: true, database, content, checkedAt: new Date().toISOString() });
});
