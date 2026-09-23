/**
 * Row ↔ domain translation.
 *
 * The tables were designed to mirror `src/lib/types.ts` closely, so most of
 * this is mechanical. The three places it is not:
 *
 *   - `location` is three flat columns (region / area / lat / lng) but one
 *     nested `GeoPlace` in the domain.
 *   - `cancellation` is two flat columns but one nested object.
 *   - a `Property` is a discriminated union: `compound` carries `units`,
 *     `hosted` carries `rooms` and a non-optional `host`. The row alone can't
 *     tell you which — it has to be assembled with its children.
 *
 * Postgres hands back `real` columns as numbers and `jsonb` as parsed values,
 * so the casts below are shape assertions, not parsing.
 */

import type {
  BookingRequest,
  Excursion,
  Host,
  Locale,
  Localized,
  Photo,
  Property,
  Provision,
  RentalItem,
  Review,
  Room,
  Seller,
  Unit,
} from "@/lib/types";
import type * as s from "./schema";

type HostRow = typeof s.hosts.$inferSelect;
type PropertyRow = typeof s.properties.$inferSelect;
type UnitRow = typeof s.units.$inferSelect;
type RoomRow = typeof s.rooms.$inferSelect;
type SellerRow = typeof s.sellers.$inferSelect;
type ProvisionRow = typeof s.provisions.$inferSelect;
type RentalRow = typeof s.rentals.$inferSelect;
type ExcursionRow = typeof s.excursions.$inferSelect;
type ReviewRow = typeof s.reviews.$inferSelect;
type BookingRow = typeof s.bookingRequests.$inferSelect;

const photos = (value: Photo[] | null): Photo[] => value ?? [];
const list = (value: Localized[] | null): Localized[] => value ?? [];
const strings = (value: string[] | null): string[] => value ?? [];

export function toHost(row: HostRow): Host {
  return {
    id: row.id,
    name: row.name,
    // `photo` is optional in the domain: the UI draws a monogram instead of
    // a broken image, which is what we want until there is a real portrait.
    ...(row.photo ? { photo: row.photo } : {}),
    since: row.since,
    about: row.about,
    languages: strings(row.languages),
    responseTimeHours: row.responseTimeHours,
  };
}

export function toUnit(row: UnitRow): Unit {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    guests: row.guests,
    bedrooms: row.bedrooms,
    beds: row.beds,
    baths: row.baths,
    ...(row.sizeSqm != null ? { sizeSqm: row.sizeSqm } : {}),
    pricePerNight: row.pricePerNight,
    photos: photos(row.photos),
    amenities: strings(row.amenities),
  };
}

export function toRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    guestsPerRoom: row.guestsPerRoom,
    pricePerPerson: row.pricePerPerson,
    quantity: row.quantity,
    photos: photos(row.photos),
    amenities: strings(row.amenities),
  };
}

/**
 * Assemble a property from its row and its children.
 *
 * Throws for a `hosted` property with no host: that is not a degraded page,
 * it is a broken row — the whole point of a guest yard is the person running
 * it, and every price on the page is per-person against their rooms. Better a
 * caught error with a retry than a page that quietly omits half of itself.
 */
export function toProperty(
  row: PropertyRow,
  children: { units: UnitRow[]; rooms: RoomRow[]; host: HostRow | null },
): Property {
  const base = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    story: row.story,
    location: {
      region: row.region,
      area: row.area,
      ...(row.lat != null ? { lat: row.lat } : {}),
      ...(row.lng != null ? { lng: row.lng } : {}),
    },
    photos: photos(row.photos),
    amenities: strings(row.amenities),
    highlights: list(row.highlights),
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    houseRules: list(row.houseRules),
    cancellation: {
      freeUntilDays: row.cancellationFreeUntilDays,
      note: row.cancellationNote,
    },
    ...(row.rating != null ? { rating: row.rating } : {}),
    ...(row.reviewCount != null ? { reviewCount: row.reviewCount } : {}),
  };

  if (row.kind === "hosted") {
    if (!children.host) {
      throw new Error(
        `property "${row.slug}" is hosted but has no host row (host_id=${row.hostId})`,
      );
    }
    return {
      ...base,
      kind: "hosted",
      host: toHost(children.host),
      rooms: children.rooms.map(toRoom),
    };
  }

  return {
    ...base,
    kind: "compound",
    units: children.units.map(toUnit),
    ...(children.host ? { host: toHost(children.host) } : {}),
  };
}

export function toSeller(row: SellerRow): Seller {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    about: row.about,
    location: {
      region: row.region,
      area: row.area,
    },
    ...(row.photo ? { photo: row.photo } : {}),
  };
}

export function toProvision(row: ProvisionRow): Provision {
  return {
    id: row.id,
    slug: row.slug,
    sellerId: row.sellerId,
    category: row.category,
    name: row.name,
    description: row.description,
    unitLabel: row.unitLabel,
    price: row.price,
    inStock: row.inStock,
    photos: photos(row.photos),
    deliveryNote: row.deliveryNote,
  };
}

export function toRental(row: RentalRow): RentalItem {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    description: row.description,
    pricePerDay: row.pricePerDay,
    deposit: row.deposit,
    quantity: row.quantity,
    delivery: row.delivery,
    pickupPoint: row.pickupPoint,
    photos: photos(row.photos),
    specs: row.specs ?? [],
  };
}

export function toExcursion(row: ExcursionRow): Excursion {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    durationHours: row.durationHours,
    pricePerPerson: row.pricePerPerson,
    groupMax: row.groupMax,
    schedule: row.schedule,
    meetingPoint: row.meetingPoint,
    photos: photos(row.photos),
    includes: list(row.includes),
    highlights: list(row.highlights),
  };
}

export function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    subjectSlug: row.subjectSlug,
    author: row.author,
    date: row.date,
    rating: row.rating,
    text: row.text,
    ...(row.booked ? { booked: row.booked } : {}),
    ...(row.reply ? { reply: row.reply } : {}),
  };
}

export function toBookingRequest(row: BookingRow): BookingRequest {
  return {
    id: row.id,
    kind: row.kind,
    subjectSlug: row.subjectSlug,
    ...(row.refId ? { refId: row.refId } : {}),
    ...(row.startDate ? { startDate: row.startDate } : {}),
    ...(row.endDate ? { endDate: row.endDate } : {}),
    ...(row.guests != null ? { guests: row.guests } : {}),
    ...(row.quantity != null ? { quantity: row.quantity } : {}),
    name: row.name,
    email: row.email,
    phone: row.phone,
    ...(row.message ? { message: row.message } : {}),
    locale: row.locale as Locale,
    status: row.status,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
  };
}
