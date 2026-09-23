/**
 * POST /api/admin/seed
 *
 * Imports `data/content.json` into Postgres. This is how content authored in
 * the file (or by the owner console) reaches the database the live site
 * reads from.
 *
 * Runs on the deployed site as well as locally, which matters: the content
 * file is committed, so after a deploy this is a single call away from the
 * database matching the repo. It is not a migration — the tables must exist
 * first (see SUPABASE.md).
 *
 *   curl -X POST https://<site>/api/admin/seed \
 *        -H "Authorization: Bearer $ADMIN_API_SECRET"
 */

import { adminAuthMessage, authorizeAdmin } from "@/lib/admin-auth";
import { fail, ok, route } from "@/lib/api";
import { readContent } from "@/lib/data/content-file";
import { hasDatabase } from "@/lib/db/client";
import { missingTables, seedFromContent } from "@/lib/db/seed";

// Reads the filesystem and opens a pool — never prerender or cache it.
export const dynamic = "force-dynamic";

export const POST = route("admin.seed.POST", async (req: Request) => {
  const auth = authorizeAdmin(req);
  if (!auth.ok) return fail("unauthorized", adminAuthMessage(auth.reason));

  if (!hasDatabase()) {
    return fail(
      "unavailable",
      "DATABASE_URL is not set on this deployment — there is nothing to seed into",
    );
  }

  const absent = await missingTables();
  if (absent.length) {
    return fail(
      "unavailable",
      `The schema has not been applied: missing ${absent.join(", ")}. ` +
        "Run the migration in drizzle/0000_initial.sql first.",
    );
  }

  const doc = await readContent();
  const report = await seedFromContent(doc);

  console.info("[admin.seed] imported", JSON.stringify(report));
  return ok({ imported: report, contentUpdatedAt: doc.updatedAt });
});
