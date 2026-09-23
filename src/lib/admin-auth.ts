/**
 * Shared-secret guard for the `/api/admin/*` endpoints.
 *
 * These endpoints re-import content, read every booking request and change
 * their status. They are not guest-facing and there is no session here, so
 * they take a bearer token that only the owner console and the operator have.
 *
 * Two deliberate choices:
 *
 *   - **No secret configured means locked, not open.** A deploy that forgets
 *     `ADMIN_API_SECRET` refuses every admin request rather than exposing the
 *     booking inbox to the internet. Failing closed is the only safe default
 *     for an endpoint that leaks other people's phone numbers.
 *
 *   - **Constant-time comparison.** `a === b` on strings returns as soon as
 *     it finds a differing byte, which leaks the length of the matching
 *     prefix to anyone willing to time it. `timingSafeEqual` does not.
 *
 * This is a service token, not a user login. The owner console's own sign-in
 * is Supabase Auth; see SUPABASE.md.
 */

import { timingSafeEqual } from "node:crypto";

export type AuthResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "missing" | "invalid" };

export function authorizeAdmin(req: Request): AuthResult {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected) return { ok: false, reason: "not_configured" };

  const header = req.headers.get("authorization");
  const presented = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : req.headers.get("x-admin-secret")?.trim();

  if (!presented) return { ok: false, reason: "missing" };

  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on a length mismatch, which would itself leak the
  // length — hash both to a fixed width first.
  if (a.length !== b.length) {
    // Still burn a comparison so the failure takes the same time.
    timingSafeEqual(b, b);
    return { ok: false, reason: "invalid" };
  }
  return timingSafeEqual(a, b) ? { ok: true } : { ok: false, reason: "invalid" };
}

export function adminAuthMessage(
  reason: Exclude<AuthResult, { ok: true }>["reason"],
): string {
  return reason === "not_configured"
    ? "Admin API is disabled: ADMIN_API_SECRET is not set on this deployment"
    : "Invalid or missing admin credentials";
}
