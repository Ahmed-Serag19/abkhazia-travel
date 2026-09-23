/**
 * Import `data/content.json` into Postgres.
 *
 * This is the bridge between the two stores. The JSON file stays the editing
 * format -- it is reviewable in a diff, and the owner console already writes
 * it -- and this pushes it into the database the site reads from.
 *
 * It replaces the content tables wholesale inside one transaction. That
 * sounds violent, but it is the right shape here:
 *
 *   - readers never see a half-imported catalogue. Postgres keeps the old
 *     rows visible to every in-flight request until the commit, so the site
 *     stays up and then changes over in one step.
 *   - removing a house from the file removes it from the site, which an
 *     upsert-only import would not do.
 *   - ids are derived deterministically from the readable ones (see
 *     `ids.ts`), so a row keeps its id across re-imports and a booking
 *     request that points at `unit-ahmad-cedar` still resolves afterwards.
 *
 * `booking_requests` is never touched. That table holds real people's
 * requests, and no content import has any business deleting them.
 */

import { sql } from "drizzle-orm";
import type { ContentDoc } from "@/lib/data/content-file";
import type { CompoundProperty, HostedProperty, Property } from "@/lib/types";
import { getDb, schema } from "./client";
import { toRowId } from "./ids";

const {
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

export interface SeedReport {
  hosts: number;
  properties: number;
  units: number;
  rooms: number;
  sellers: number;
  provisions: number;
  rentals: number;
  excursions: number;
  reviews: number;
}

const isCompound = (p: Property): p is CompoundProperty =>
  p.kind === "compound";
const isHosted = (p: Property): p is HostedProperty => p.kind === "hosted";

export async function seedFromContent(doc: ContentDoc): Promise<SeedReport> {
  const db = getDb();

  /* ---- hosts (properties reference them, so they go in first) ------ */

  // Deduplicated by id: one person can host more than one property, and the
  // content file repeats them inline rather than referencing a host list.
  const hostRows = [
    ...new Map(
      doc.properties
        .map((p) => p.host)
        .filter((h): h is NonNullable<typeof h> => Boolean(h))
        .map((h) => [
          toRowId(h.id),
          {
            id: toRowId(h.id),
            name: h.name,
            photo: h.photo ?? null,
            since: h.since,
            about: h.about,
            languages: h.languages,
            responseTimeHours: h.responseTimeHours,
          },
        ] as const),
    ).values(),
  ];

  /* ---- stay -------------------------------------------------------- */

  const propertyRows = doc.properties.map((p) => ({
    id: toRowId(p.id),
    slug: p.slug,
    kind: p.kind,
    name: p.name,
    tagline: p.tagline,
    story: p.story,
    region: p.location.region,
    area: p.location.area,
    lat: p.location.lat ?? null,
    lng: p.location.lng ?? null,
    photos: p.photos,
    amenities: p.amenities,
    highlights: p.highlights,
    checkIn: p.checkIn,
    checkOut: p.checkOut,
    houseRules: p.houseRules,
    cancellationFreeUntilDays: p.cancellation.freeUntilDays,
    cancellationNote: p.cancellation.note,
    rating: p.rating ?? null,
    reviewCount: p.reviewCount ?? null,
    hostId: p.host ? toRowId(p.host.id) : null,
  }));

  const unitRows = doc.properties.flatMap((p) =>
    isCompound(p)
      ? p.units.map((u) => ({
          id: toRowId(u.id),
          propertyId: toRowId(p.id),
          name: u.name,
          description: u.description,
          guests: u.guests,
          bedrooms: u.bedrooms,
          beds: u.beds,
          baths: u.baths,
          sizeSqm: u.sizeSqm ?? null,
          pricePerNight: u.pricePerNight,
          photos: u.photos,
          amenities: u.amenities,
        }))
      : [],
  );

  const roomRows = doc.properties.flatMap((p) =>
    isHosted(p)
      ? p.rooms.map((r) => ({
          id: toRowId(r.id),
          propertyId: toRowId(p.id),
          name: r.name,
          description: r.description,
          guestsPerRoom: r.guestsPerRoom,
          pricePerPerson: r.pricePerPerson,
          quantity: r.quantity,
          photos: r.photos,
          amenities: r.amenities,
        }))
      : [],
  );

  /* ---- village ----------------------------------------------------- */

  const sellerRows = doc.sellers.map((s) => ({
    id: toRowId(s.id),
    slug: s.slug,
    name: s.name,
    about: s.about,
    region: s.location.region,
    area: s.location.area,
    photo: s.photo ?? null,
  }));

  const provisionRows = doc.provisions.map((p) => ({
    id: toRowId(p.id),
    slug: p.slug,
    sellerId: toRowId(p.sellerId),
    category: p.category,
    name: p.name,
    description: p.description,
    unitLabel: p.unitLabel,
    price: p.price,
    inStock: p.inStock,
    photos: p.photos,
    deliveryNote: p.deliveryNote,
  }));

  /* ---- rent & explore ---------------------------------------------- */

  const rentalRows = doc.rentals.map((r) => ({
    id: toRowId(r.id),
    slug: r.slug,
    category: r.category,
    name: r.name,
    description: r.description,
    pricePerDay: r.pricePerDay,
    deposit: r.deposit,
    quantity: r.quantity,
    delivery: r.delivery,
    pickupPoint: r.pickupPoint,
    photos: r.photos,
    specs: r.specs,
  }));

  const excursionRows = doc.excursions.map((e) => ({
    id: toRowId(e.id),
    slug: e.slug,
    name: e.name,
    summary: e.summary,
    description: e.description,
    durationHours: e.durationHours,
    pricePerPerson: e.pricePerPerson,
    groupMax: e.groupMax,
    schedule: e.schedule,
    meetingPoint: e.meetingPoint,
    photos: e.photos,
    includes: e.includes,
    highlights: e.highlights,
  }));

  const reviewRows = doc.reviews.map((r) => ({
    id: toRowId(r.id),
    subjectSlug: r.subjectSlug,
    author: r.author,
    date: r.date,
    rating: r.rating,
    text: r.text,
    booked: r.booked ?? null,
    reply: r.reply ?? null,
    published: true,
  }));

  /* ---- write ------------------------------------------------------- */

  await db.transaction(async (tx) => {
    // Children before parents. The FKs cascade, but being explicit keeps the
    // order obvious to whoever adds the next table.
    await tx.delete(units);
    await tx.delete(rooms);
    await tx.delete(provisions);
    await tx.delete(reviews);
    await tx.delete(properties);
    await tx.delete(sellers);
    await tx.delete(hosts);
    await tx.delete(rentals);
    await tx.delete(excursions);

    if (hostRows.length) await tx.insert(hosts).values(hostRows);
    if (propertyRows.length) await tx.insert(properties).values(propertyRows);
    if (unitRows.length) await tx.insert(units).values(unitRows);
    if (roomRows.length) await tx.insert(rooms).values(roomRows);
    if (sellerRows.length) await tx.insert(sellers).values(sellerRows);
    if (provisionRows.length)
      await tx.insert(provisions).values(provisionRows);
    if (rentalRows.length) await tx.insert(rentals).values(rentalRows);
    if (excursionRows.length)
      await tx.insert(excursions).values(excursionRows);
    if (reviewRows.length) await tx.insert(reviews).values(reviewRows);
  });

  return {
    hosts: hostRows.length,
    properties: propertyRows.length,
    units: unitRows.length,
    rooms: roomRows.length,
    sellers: sellerRows.length,
    provisions: provisionRows.length,
    rentals: rentalRows.length,
    excursions: excursionRows.length,
    reviews: reviewRows.length,
  };
}

const EXPECTED_TABLES = [
  "properties",
  "units",
  "rooms",
  "hosts",
  "sellers",
  "provisions",
  "rentals",
  "excursions",
  "reviews",
  "booking_requests",
];

/**
 * Which of the expected tables are missing.
 *
 * The health endpoint reports this, because "the database is configured but
 * the migration was never applied" and "the database is unreachable" produce
 * the same 500 at the page level and want completely different fixes.
 */
export async function missingTables(): Promise<string[]> {
  const db = getDb();
  const rows = await db.execute<{ table_name: string }>(
    sql`select table_name from information_schema.tables
        where table_schema = 'public'`,
  );
  const present = new Set(
    (rows as unknown as { table_name: string }[]).map((r) => r.table_name),
  );
  return EXPECTED_TABLES.filter((t) => !present.has(t));
}
