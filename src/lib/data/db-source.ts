/**
 * `DataSource` backed by Supabase Postgres, through Drizzle.
 *
 * Same interface as `jsonSource` and `fixtureSource` — pages and route
 * handlers cannot tell which one they got. This is the one that runs in
 * production once `DATABASE_URL` is set.
 *
 * ON QUERY SHAPE: a property is one row plus its units, rooms and host. Doing
 * that as four round trips per property would be four × N on the index page.
 * Instead the list query fetches each table once and joins in memory — five
 * queries total regardless of how many properties there are. At this size
 * (tens of rows, not thousands) that is strictly faster than the SQL join,
 * and it avoids the row multiplication a join across two child tables causes.
 */

import { asc, desc, eq, inArray } from "drizzle-orm";
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
import { getDb, schema } from "@/lib/db/client";
import { serialize } from "@/lib/db/serialize";
import {
  toBookingRequest,
  toExcursion,
  toProperty,
  toProvision,
  toRental,
  toReview,
  toSeller,
} from "@/lib/db/mappers";
import type { DataSource } from "./index";
import { propertySummary } from "./summary";

const {
  bookingRequests,
  excursions,
  hosts,
  properties,
  provisions,
  rentals,
  reviews,
  rooms,
  sellers,
  units,
} = schema;

/** Build full `Property` objects for the given rows, in one pass. */
async function assemble(
  rows: (typeof properties.$inferSelect)[],
): Promise<Property[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const ids = rows.map((r) => r.id);
  const hostIds = rows.map((r) => r.hostId).filter((id): id is string => !!id);

  // Sequential, like everything else that touches this database — see
  // `serialize.ts` for why concurrent queries are not an option here.
  const unitRows = await db
    .select()
    .from(units)
    .where(inArray(units.propertyId, ids));
  const roomRows = await db
    .select()
    .from(rooms)
    .where(inArray(rooms.propertyId, ids));
  const hostRows = hostIds.length
    ? await db.select().from(hosts).where(inArray(hosts.id, hostIds))
    : [];

  const byProperty = <T extends { propertyId: string }>(all: T[], id: string) =>
    all.filter((r) => r.propertyId === id);
  const hostById = new Map(hostRows.map((h) => [h.id, h]));

  return rows.map((row) =>
    toProperty(row, {
      units: byProperty(unitRows, row.id),
      rooms: byProperty(roomRows, row.id),
      host: row.hostId ? (hostById.get(row.hostId) ?? null) : null,
    }),
  );
}

const rawSource: DataSource = {
  async listProperties(): Promise<PropertySummary[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(properties)
      .orderBy(asc(properties.createdAt));
    return (await assemble(rows)).map(propertySummary);
  },

  async getProperty(slug: string): Promise<Property | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(properties)
      .where(eq(properties.slug, slug))
      .limit(1);
    if (rows.length === 0) return null;
    return (await assemble(rows))[0] ?? null;
  },

  async listSellers(): Promise<Seller[]> {
    const db = getDb();
    return (await db.select().from(sellers).orderBy(asc(sellers.slug))).map(
      toSeller,
    );
  },

  async getSeller(slug: string): Promise<Seller | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.slug, slug))
      .limit(1);
    return row ? toSeller(row) : null;
  },

  async listProvisions(): Promise<Provision[]> {
    const db = getDb();
    return (
      await db.select().from(provisions).orderBy(asc(provisions.slug))
    ).map(toProvision);
  },

  async getProvision(slug: string): Promise<Provision | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(provisions)
      .where(eq(provisions.slug, slug))
      .limit(1);
    return row ? toProvision(row) : null;
  },

  async listRentals(): Promise<RentalItem[]> {
    const db = getDb();
    return (await db.select().from(rentals).orderBy(asc(rentals.slug))).map(
      toRental,
    );
  },

  async getRental(slug: string): Promise<RentalItem | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(rentals)
      .where(eq(rentals.slug, slug))
      .limit(1);
    return row ? toRental(row) : null;
  },

  async listExcursions(): Promise<Excursion[]> {
    const db = getDb();
    return (
      await db.select().from(excursions).orderBy(asc(excursions.slug))
    ).map(toExcursion);
  },

  async getExcursion(slug: string): Promise<Excursion | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(excursions)
      .where(eq(excursions.slug, slug))
      .limit(1);
    return row ? toExcursion(row) : null;
  },

  async listReviews(subjectSlug: string): Promise<Review[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(reviews)
      .where(eq(reviews.subjectSlug, subjectSlug))
      .orderBy(desc(reviews.date));
    return rows.filter((r) => r.published).map(toReview);
  },

  async createBookingRequest(
    input: BookingRequestInput,
  ): Promise<BookingRequest> {
    const db = getDb();
    const [row] = await db
      .insert(bookingRequests)
      .values({
        kind: input.kind,
        subjectSlug: input.subjectSlug,
        refId: input.refId ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        guests: input.guests ?? null,
        quantity: input.quantity ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message ?? null,
        locale: input.locale,
        status: "new",
      })
      .returning();

    if (!row) {
      // An insert that returns nothing means the row did not land. Saying
      // "sent" to a guest whose request does not exist is the worst failure
      // this site has, so it throws and the form shows the error.
      throw new Error("booking request insert returned no row");
    }
    return toBookingRequest(row);
  },
};

/**
 * Every method, wrapped in the process-wide query queue.
 *
 * Applied here rather than inside each method so a method added later cannot
 * forget it. What it protects against is silent and intermittent, and a
 * convention people have to remember does not prevent that kind of bug.
 */
export const dbSource: DataSource = Object.fromEntries(
  Object.entries(rawSource).map(([name, method]) => [
    name,
    (...args: unknown[]) =>
      serialize(() =>
        (method as (...a: unknown[]) => Promise<unknown>)(...args),
      ),
  ]),
) as unknown as DataSource;

/* ------------------------------------------------------------------ */
/* owner-facing reads and writes (the console, not the guest site)     */
/* ------------------------------------------------------------------ */

export function listBookingRequests(limit = 200) {
  return serialize(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(bookingRequests)
      .orderBy(desc(bookingRequests.createdAt))
      .limit(limit);
    return rows.map(toBookingRequest);
  });
}

export function setBookingStatus(id: string, status: BookingRequest["status"]) {
  return serialize(async () => {
    const db = getDb();
    const [row] = await db
      .update(bookingRequests)
      .set({ status })
      .where(eq(bookingRequests.id, id))
      .returning();
    return row ? toBookingRequest(row) : null;
  });
}
