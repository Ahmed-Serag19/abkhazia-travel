/**
 * GET /api/admin/booking-requests
 *
 * The owner's inbox. Every request a guest has sent, newest first.
 *
 * This is the endpoint the console reads instead of the shared JSON file —
 * once the database is wired, the two apps no longer have to live on the same
 * machine to see the same requests.
 *
 * It returns names, emails and phone numbers, so it is behind the admin
 * secret and marked `no-store`: a cached copy of this on a CDN would be a
 * data breach with a URL.
 */

import { adminAuthMessage, authorizeAdmin } from "@/lib/admin-auth";
import { fail, ok, route } from "@/lib/api";
import { hasDatabase } from "@/lib/db/client";
import { listBookingRequests } from "@/lib/data/db-source";
import { readContent } from "@/lib/data/content-file";

export const dynamic = "force-dynamic";

export const GET = route("admin.bookingRequests.GET", async (req: Request) => {
  const auth = authorizeAdmin(req);
  if (!auth.ok) return fail("unauthorized", adminAuthMessage(auth.reason));

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 200) || 200, 500);

  const requests = hasDatabase()
    ? await listBookingRequests(limit)
    : (await readContent()).bookingRequests.slice(0, limit);

  return ok(
    { requests, source: hasDatabase() ? "db" : "file", count: requests.length },
    { headers: { "cache-control": "no-store" } },
  );
});
