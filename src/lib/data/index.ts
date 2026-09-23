/**
 * Single entry point for reading content.
 *
 *   const data = getData();
 *   const stays = await data.listProperties();
 *
 * Three interchangeable sources, picked by `DATA_SOURCE`:
 *   - `json` (default) — the editable content file the owner console writes to
 *   - `fixtures`       — the original hard-coded seed data
 *   - `api`            — the route handlers in `src/app/api`
 *
 * When Supabase lands it becomes a fourth (Drizzle) behind the same interface.
 *
 * FAILURE POLICY (see also docs in README):
 *   - A read the page *is about* (the property you opened) is allowed to
 *     throw. The segment's error.tsx catches it and offers a retry — that is
 *     honest, and far better than rendering a 404 for a database blip.
 *   - A supporting read (reviews, cross-sell) is wrapped in `optional()`,
 *     which logs and degrades to an empty result so the page still renders.
 */

import type {
  BookingRequest,
  BookingRequestInput,
  Excursion,
  Property,
  PropertySummary,
  Provision,
  RentalItem,
  Review,
  Seller,
} from "@/lib/types";
import {
  excursions,
  properties,
  provisions,
  rentals,
  sellers,
} from "./fixtures";
import { reviewsFor } from "./reviews";
import { propertySummary } from "./summary";
import { jsonSource } from "./json-source";
import { dbSource } from "./db-source";
import { hasDatabase } from "@/lib/db/client";

export interface DataSource {
  listProperties(): Promise<PropertySummary[]>;
  getProperty(slug: string): Promise<Property | null>;

  listSellers(): Promise<Seller[]>;
  getSeller(slug: string): Promise<Seller | null>;
  listProvisions(): Promise<Provision[]>;
  getProvision(slug: string): Promise<Provision | null>;

  listRentals(): Promise<RentalItem[]>;
  getRental(slug: string): Promise<RentalItem | null>;

  listExcursions(): Promise<Excursion[]>;
  getExcursion(slug: string): Promise<Excursion | null>;

  listReviews(subjectSlug: string): Promise<Review[]>;

  createBookingRequest(input: BookingRequestInput): Promise<BookingRequest>;
}

/* ------------------------------------------------------------------ */
/* resilience helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Run a supporting read that must never take the page down with it.
 * Logs the failure and returns `fallback`.
 */
export async function optional<T>(
  label: string,
  read: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[data] optional read "${label}" failed:`, error);
    return fallback;
  }
}

export class DataSourceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "DataSourceError";
  }
}

/** fetch with a hard timeout and one retry on transient failures */
async function resilientFetch(
  url: string,
  init: RequestInit = {},
  { timeoutMs = 8000, retries = 1 } = {},
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      // 5xx is worth one retry; 4xx is our own bug and never is.
      if (res.status >= 500 && attempt < retries) {
        lastError = new DataSourceError(`${url} → ${res.status}`, res.status);
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      // short linear backoff — these are user-facing reads, not a job queue
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }

  throw new DataSourceError(`request to ${url} failed`, undefined, {
    cause: lastError,
  });
}

/* ------------------------------------------------------------------ */
/* helpers shared by any source                                        */
/* ------------------------------------------------------------------ */

export { propertySummary, fromPriceOf } from "./summary";

/* ------------------------------------------------------------------ */
/* fixture source                                                      */
/* ------------------------------------------------------------------ */

// In-memory sink so the booking form has somewhere to write during the demo.
const bookingRequests: BookingRequest[] = [];

const fixtureSource: DataSource = {
  async listProperties() {
    return properties.map(propertySummary);
  },
  async getProperty(slug) {
    return properties.find((p) => p.slug === slug) ?? null;
  },
  async listSellers() {
    return sellers;
  },
  async getSeller(slug) {
    return sellers.find((s) => s.slug === slug) ?? null;
  },
  async listProvisions() {
    return provisions;
  },
  async getProvision(slug) {
    return provisions.find((p) => p.slug === slug) ?? null;
  },
  async listRentals() {
    return rentals;
  },
  async getRental(slug) {
    return rentals.find((r) => r.slug === slug) ?? null;
  },
  async listExcursions() {
    return excursions;
  },
  async getExcursion(slug) {
    return excursions.find((e) => e.slug === slug) ?? null;
  },
  async listReviews(subjectSlug) {
    return reviewsFor(subjectSlug);
  },
  async createBookingRequest(input) {
    const request: BookingRequest = {
      ...input,
      id: `req-${Date.now().toString(36)}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    bookingRequests.push(request);
    console.info("[booking-request]", JSON.stringify(request, null, 2));
    return request;
  },
};

/* ------------------------------------------------------------------ */
/* api source (stub — wire to route handlers / Supabase later)         */
/* ------------------------------------------------------------------ */

function apiBase() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await resilientFetch(`${apiBase()}/api${path}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null as T;
  if (!res.ok) {
    throw new DataSourceError(`GET ${path} → ${res.status}`, res.status);
  }
  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new DataSourceError(`GET ${path} returned invalid JSON`, undefined, {
      cause: error,
    });
  }
}

const apiSource: DataSource = {
  listProperties: () => apiGet("/properties"),
  getProperty: (slug) => apiGet(`/properties/${encodeURIComponent(slug)}`),
  listSellers: () => apiGet("/sellers"),
  getSeller: (slug) => apiGet(`/sellers/${encodeURIComponent(slug)}`),
  listProvisions: () => apiGet("/provisions"),
  getProvision: (slug) => apiGet(`/provisions/${encodeURIComponent(slug)}`),
  listRentals: () => apiGet("/rentals"),
  getRental: (slug) => apiGet(`/rentals/${encodeURIComponent(slug)}`),
  listExcursions: () => apiGet("/excursions"),
  getExcursion: (slug) => apiGet(`/excursions/${encodeURIComponent(slug)}`),
  listReviews: (subjectSlug) =>
    apiGet(`/reviews/${encodeURIComponent(subjectSlug)}`),
  async createBookingRequest(input) {
    const res = await resilientFetch(
      `${apiBase()}/api/booking-requests`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      },
      // A write must not be retried blindly — a duplicate booking request is
      // worse than an error the guest can act on.
      { retries: 0, timeoutMs: 10_000 },
    );
    if (!res.ok) {
      throw new DataSourceError(
        `POST booking-requests → ${res.status}`,
        res.status,
      );
    }
    return res.json() as Promise<BookingRequest>;
  },
};

/* ------------------------------------------------------------------ */

/**
 * Which source serves this request.
 *
 * The default is deliberately *conditional on configuration rather than on a
 * flag*: set `DATABASE_URL` and the site talks to Supabase; leave it unset
 * and it serves `data/content.json`. There is no state where the database is
 * configured but ignored, and no deploy step that consists of remembering to
 * flip a second variable.
 *
 * `DATA_SOURCE` overrides it explicitly, which is what you want when the
 * database exists but you are debugging against the file:
 *
 *   db        Supabase via Drizzle
 *   json      the editable content file
 *   fixtures  the original hard-coded seed
 *   api       through this app's own route handlers (integration testing)
 */
export function getData(): DataSource {
  switch (process.env.DATA_SOURCE) {
    case "api":
      return apiSource;
    case "fixtures":
      return fixtureSource;
    case "json":
      return jsonSource;
    case "db":
      return dbSource;
    default:
      return hasDatabase() ? dbSource : jsonSource;
  }
}

/**
 * The source route handlers use.
 *
 * Identical to `getData()` except that it never returns `apiSource` — a route
 * handler calling the API would call itself.
 */
export function getServerData(): DataSource {
  const source = getData();
  return source === apiSource ? (hasDatabase() ? dbSource : jsonSource) : source;
}

/** the fixture source directly — the seed route reads from it */
export { fixtureSource, jsonSource, dbSource };
