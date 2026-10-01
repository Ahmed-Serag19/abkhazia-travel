/**
 * Single entry point for reading content.
 *
 *   const data = getData();
 *   const stays = await data.listProperties();
 *
 * There is one source: Supabase Postgres, through Drizzle (`db-source.ts`).
 * The owner console writes to the same database, so what the owner edits is
 * what guests see. There is deliberately no fallback — if `DATABASE_URL` is
 * missing the build and the pages fail loudly instead of quietly serving
 * something that is not the owner's catalogue.
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
import { dbSource } from "./db-source";

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

/* ------------------------------------------------------------------ */
/* helpers shared by any source                                        */
/* ------------------------------------------------------------------ */

export { propertySummary, fromPriceOf } from "./summary";

/* ------------------------------------------------------------------ */

/** The source pages read from: Supabase. */
export function getData(): DataSource {
  return dbSource;
}

/** The source route handlers use. Same as `getData()`. */
export function getServerData(): DataSource {
  return dbSource;
}

export { dbSource };
