/**
 * Shared plumbing for the route handlers.
 *
 * Every API response — success or failure — has the same shape, so the client
 * never has to guess. Failures carry a `reference` that also appears in the
 * server log, which is what makes a support conversation tractable.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DataSourceError } from "@/lib/data";

export type ApiErrorCode =
  | "bad_json"
  | "validation"
  | "not_found"
  | "unauthorized"
  | "unavailable"
  | "rate_limited"
  | "upstream"
  | "internal";

const STATUS: Record<ApiErrorCode, number> = {
  bad_json: 400,
  validation: 422,
  not_found: 404,
  unauthorized: 401,
  unavailable: 503,
  rate_limited: 429,
  upstream: 502,
  internal: 500,
};

export interface ApiError {
  error: ApiErrorCode;
  /** safe, non-leaking summary */
  message: string;
  /** correlates the response with the server log line */
  reference: string;
  details?: unknown;
}

function reference() {
  return Math.random().toString(36).slice(2, 10);
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: code, message, reference: reference(), details },
    { status: STATUS[code] },
  );
}

export function notFound(what = "resource") {
  return fail("not_found", `${what} not found`);
}

/**
 * Wraps a handler so an unexpected throw becomes a logged, referenced 500
 * instead of an unhandled rejection and a blank response.
 *
 * Internal messages are logged, never returned — a stack trace in a response
 * body is how people find your database.
 */
export function route<Args extends unknown[]>(
  name: string,
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const ref = reference();

      if (error instanceof ZodError) {
        console.warn(`[api:${name}] validation failed (${ref})`, error.issues);
        return NextResponse.json(
          {
            error: "validation",
            message: "Request body failed validation",
            reference: ref,
            details: error.flatten(),
          },
          { status: 422 },
        );
      }

      if (error instanceof DataSourceError) {
        console.error(`[api:${name}] upstream failure (${ref})`, error);
        return NextResponse.json(
          {
            error: "upstream",
            message: "A service this endpoint depends on did not respond",
            reference: ref,
          },
          { status: 502 },
        );
      }

      console.error(`[api:${name}] unhandled error (${ref})`, error);
      return NextResponse.json(
        {
          error: "internal",
          message: "Unexpected server error",
          reference: ref,
        },
        { status: 500 },
      );
    }
  };
}

/* ------------------------------------------------------------------ */
/* rate limiting                                                       */
/* ------------------------------------------------------------------ */

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window limiter for the write endpoint.
 *
 * In-memory, so it is per-instance and resets on deploy — enough to stop a
 * stuck retry loop or a bored someone hammering the booking form, not a
 * defence against a real attack. Move to Upstash/Redis before that matters.
 */
export function rateLimit(
  key: string,
  { limit = 8, windowMs = 60_000 } = {},
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Best-effort client identity for rate limiting. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
