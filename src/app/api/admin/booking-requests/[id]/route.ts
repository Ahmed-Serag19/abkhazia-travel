/**
 * PATCH /api/admin/booking-requests/[id]
 *
 * Confirm, decline or cancel a request. The only mutable field — everything
 * else a guest wrote is a record of what they asked for, and the owner
 * editing it after the fact would make the inbox untrustworthy.
 */

import { z } from "zod";
import { adminAuthMessage, authorizeAdmin } from "@/lib/admin-auth";
import { fail, notFound, ok, route } from "@/lib/api";
import { hasDatabase } from "@/lib/db/client";
import { setBookingStatus } from "@/lib/data/db-source";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["new", "confirmed", "declined", "cancelled"]),
});

export const PATCH = route(
  "admin.bookingRequests.PATCH",
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const auth = authorizeAdmin(req);
    if (!auth.ok) return fail("unauthorized", adminAuthMessage(auth.reason));

    if (!hasDatabase()) {
      return fail(
        "unavailable",
        "No database configured — status changes have nowhere durable to go",
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail("bad_json", "Body could not be parsed as JSON");
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return fail("validation", "Request failed validation", parsed.error.flatten());
    }

    const { id } = await ctx.params;
    const updated = await setBookingStatus(id, parsed.data.status);
    if (!updated) return notFound("booking request");

    console.info(`[admin] booking ${id} → ${parsed.data.status}`);
    return ok(updated, { headers: { "cache-control": "no-store" } });
  },
);
