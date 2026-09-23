/**
 * Drizzle schema — the target shape for Supabase Postgres.
 *
 * Localized text is stored as JSONB `{ ru, en, ab }`. Photos are JSONB arrays
 * of `{ src, alt }`. This keeps the row model close to the TypeScript types
 * in `src/lib/types.ts` so the fixture → API swap is mechanical.
 *
 * Generate SQL:  npx drizzle-kit generate
 * Push to DB:    npx drizzle-kit push
 */

import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import type { Localized, Money, Photo, RentalSpec } from "@/lib/types";

/* enums ------------------------------------------------------------- */

export const propertyKind = pgEnum("property_kind", ["compound", "hosted"]);
export const provisionCategory = pgEnum("provision_category", [
  "dairy",
  "eggs",
  "honey",
  "produce",
  "bakery",
  "preserves",
]);
export const rentalCategory = pgEnum("rental_category", [
  "car",
  "water",
  "beach",
  "camping",
  "bike",
]);
export const bookingKind = pgEnum("booking_kind", [
  "stay-unit",
  "stay-room",
  "rental",
  "excursion",
  "provision-order",
]);
export const bookingStatus = pgEnum("booking_status", [
  "new",
  "confirmed",
  "declined",
  "cancelled",
]);

/* helper column types --------------------------------------------- */

const localized = (name: string) => jsonb(name).$type<Localized>().notNull();
const localizedList = (name: string) =>
  jsonb(name).$type<Localized[]>().notNull().default([]);
const photos = (name: string) =>
  jsonb(name).$type<Photo[]>().notNull().default([]);
const money = (name: string) => jsonb(name).$type<Money>().notNull();
const strList = (name: string) =>
  jsonb(name).$type<string[]>().notNull().default([]);

/* stay ------------------------------------------------------------- */

export const hosts = pgTable("hosts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  photo: jsonb("photo").$type<Photo>(),
  since: integer("since").notNull(),
  about: localized("about"),
  languages: strList("languages"),
  responseTimeHours: integer("response_time_hours").notNull().default(24),
});

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  kind: propertyKind("kind").notNull(),
  name: localized("name"),
  tagline: localized("tagline"),
  story: localized("story"),
  region: localized("region"),
  area: localized("area"),
  lat: real("lat"),
  lng: real("lng"),
  photos: photos("photos"),
  amenities: strList("amenities"),
  highlights: localizedList("highlights"),
  checkIn: text("check_in").notNull().default("14:00"),
  checkOut: text("check_out").notNull().default("11:00"),
  houseRules: localizedList("house_rules"),
  cancellationFreeUntilDays: integer("cancellation_free_until_days")
    .notNull()
    .default(7),
  cancellationNote: localized("cancellation_note"),
  rating: real("rating"),
  reviewCount: integer("review_count"),
  hostId: uuid("host_id").references(() => hosts.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** whole-unit rentals inside a `compound` property */
export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  name: localized("name"),
  description: localized("description"),
  guests: integer("guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  beds: integer("beds").notNull(),
  baths: integer("baths").notNull(),
  sizeSqm: integer("size_sqm"),
  pricePerNight: money("price_per_night"),
  photos: photos("photos"),
  amenities: strList("amenities"),
}, (t) => [
  index("units_property_idx").on(t.propertyId),
]);

/** per-person rooms managed by a `hosted` property's host */
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  name: localized("name"),
  description: localized("description"),
  guestsPerRoom: integer("guests_per_room").notNull(),
  pricePerPerson: money("price_per_person"),
  quantity: integer("quantity").notNull().default(1),
  photos: photos("photos"),
  amenities: strList("amenities"),
}, (t) => [
  index("rooms_property_idx").on(t.propertyId),
]);

/* village -------------------------------------------------------- */

export const sellers = pgTable("sellers", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: localized("name"),
  about: localized("about"),
  region: localized("region"),
  area: localized("area"),
  photo: jsonb("photo").$type<Photo>(),
});

export const provisions = pgTable("provisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => sellers.id, { onDelete: "cascade" }),
  category: provisionCategory("category").notNull(),
  name: localized("name"),
  description: localized("description"),
  unitLabel: localized("unit_label"),
  price: money("price"),
  inStock: boolean("in_stock").notNull().default(true),
  photos: photos("photos"),
  deliveryNote: localized("delivery_note"),
}, (t) => [
  index("provisions_seller_idx").on(t.sellerId),
  index("provisions_category_idx").on(t.category),
]);

/* rent ---------------------------------------------------------- */

export const rentals = pgTable("rentals", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  category: rentalCategory("category").notNull(),
  name: localized("name"),
  description: localized("description"),
  pricePerDay: money("price_per_day"),
  deposit: money("deposit"),
  quantity: integer("quantity").notNull().default(1),
  delivery: boolean("delivery").notNull().default(false),
  pickupPoint: localized("pickup_point"),
  photos: photos("photos"),
  specs: jsonb("specs").$type<RentalSpec[]>().notNull().default([]),
}, (t) => [
  index("rentals_category_idx").on(t.category),
]);

/* explore ----------------------------------------------------- */

export const excursions = pgTable("excursions", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: localized("name"),
  summary: localized("summary"),
  description: localized("description"),
  durationHours: real("duration_hours").notNull(),
  pricePerPerson: money("price_per_person"),
  groupMax: integer("group_max").notNull(),
  schedule: localized("schedule"),
  meetingPoint: localized("meeting_point"),
  photos: photos("photos"),
  includes: localizedList("includes"),
  highlights: localizedList("highlights"),
});

/* booking requests ------------------------------------------ */

export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: bookingKind("kind").notNull(),
  subjectSlug: text("subject_slug").notNull(),
  refId: text("ref_id"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  guests: integer("guests"),
  quantity: integer("quantity"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  locale: text("locale").notNull().default("ru"),
  status: bookingStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  index("booking_requests_created_idx").on(t.createdAt),
  index("booking_requests_status_idx").on(t.status),
]);

/* reviews ----------------------------------------------------- */

/**
 * Reviews are keyed by the *slug* of what was reviewed, not a foreign key,
 * because a review can belong to a property or an excursion — two different
 * tables. A slug is stable and unique across both, and the alternative
 * (a polymorphic FK, or one nullable FK per subject type) buys nothing here.
 */
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectSlug: text("subject_slug").notNull(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  rating: real("rating").notNull(),
  text: localized("text"),
  booked: jsonb("booked").$type<Localized>(),
  reply: jsonb("reply").$type<Localized>(),
  published: boolean("published").notNull().default(true),
}, (t) => [
  index("reviews_subject_idx").on(t.subjectSlug),
]);

export type ReviewRow = typeof reviews.$inferSelect;

export type PropertyRow = typeof properties.$inferSelect;
export type UnitRow = typeof units.$inferSelect;
export type RoomRow = typeof rooms.$inferSelect;
export type BookingRequestRow = typeof bookingRequests.$inferSelect;
