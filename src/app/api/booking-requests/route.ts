import { getServerData } from "@/lib/data";
import { bookingRequestSchema } from "@/lib/validation";
import { clientKey, fail, ok, rateLimit, route } from "@/lib/api";

export const POST = route("booking-requests.POST", async (req: Request) => {
  // Layer: abuse. A stuck client retrying forever must not become a flood of
  // requests the owner has to wade through.
  const limit = rateLimit(`booking:${clientKey(req)}`);
  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many requests. Try again in ${limit.retryAfter}s.`,
    );
  }

  // Layer: transport. A truncated or non-JSON body is the client's problem,
  // not a 500.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("bad_json", "Body could not be parsed as JSON");
  }

  // Layer: shape. Never trust the form that submitted this.
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "validation",
      "Request failed validation",
      parsed.error.flatten(),
    );
  }

  // Where this lands depends on configuration, not on this file: with
  // DATABASE_URL set it is an INSERT into `booking_requests`, without it the
  // content file. Anything thrown is caught by `route()` above and returned
  // as a referenced 500 — which is the honest answer, because a guest told
  // "sent" about a request that was never stored is this site's worst bug.
  //
  // TODO(notify): the owner still has to be told a request arrived. Resend
  //               email or a Telegram message, after the insert commits.
  const created = await getServerData().createBookingRequest(parsed.data);
  return ok(created, { status: 201 });
});
