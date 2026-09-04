/**
 * Domain model for the Abkhazia travel platform.
 *
 * Everything user-facing is `Localized` (ru / en / ab). The same shapes are
 * produced by the fixture data source today and by the API / Drizzle source
 * later — see `src/lib/data`.
 */

import type { Locale } from "@/i18n/routing";

export type { Locale };

export type Localized = Record<Locale, string>;

export interface Money {
  /** minor-unit-free integer amount, e.g. 4500 == 4500 ₽ */
  amount: number;
  currency: "RUB";
}

export interface Photo {
  src: string;
  alt: Localized;
}

export interface GeoPlace {
  /** e.g. "Gagra district" */
  region: Localized;
  /** settlement / village, e.g. "Tsandripsh" */
  area: Localized;
  lat?: number;
  lng?: number;
}

/* ------------------------------------------------------------------ */
/* Stay                                                                */
/* ------------------------------------------------------------------ */

export type PropertyKind = "compound" | "hosted";

export interface Host {
  id: string;
  name: string;
  /** omit until there is a real portrait — the UI falls back to a monogram */
  photo?: Photo;
  /** year they started hosting */
  since: number;
  about: Localized;
  languages: string[];
  responseTimeHours: number;
}

/** A whole-unit rental inside a `compound` property (e.g. "Casa 2"). */
export interface Unit {
  id: string;
  name: Localized;
  description: Localized;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  sizeSqm?: number;
  pricePerNight: Money;
  photos: Photo[];
  amenities: string[];
}

/** A per-person room managed by a `hosted` property's host. */
export interface Room {
  id: string;
  name: Localized;
  description: Localized;
  guestsPerRoom: number;
  pricePerPerson: Money;
  /** how many rooms of this type the host can offer */
  quantity: number;
  photos: Photo[];
  amenities: string[];
}

export interface CancellationPolicy {
  /** free cancellation up to N days before arrival */
  freeUntilDays: number;
  note: Localized;
}

interface PropertyBase {
  id: string;
  slug: string;
  kind: PropertyKind;
  name: Localized;
  tagline: Localized;
  story: Localized;
  location: GeoPlace;
  photos: Photo[];
  amenities: string[];
  highlights: Localized[];
  checkIn: string;
  checkOut: string;
  houseRules: Localized[];
  cancellation: CancellationPolicy;
  rating?: number;
  reviewCount?: number;
}

export interface CompoundProperty extends PropertyBase {
  kind: "compound";
  units: Unit[];
  host?: Host;
}

export interface HostedProperty extends PropertyBase {
  kind: "hosted";
  host: Host;
  rooms: Room[];
}

export type Property = CompoundProperty | HostedProperty;

export interface PropertySummary {
  id: string;
  slug: string;
  kind: PropertyKind;
  name: Localized;
  tagline: Localized;
  location: GeoPlace;
  cover: Photo;
  /** cheapest nightly (compound) or per-person (hosted) price */
  fromPrice: Money;
  priceUnit: "night" | "person";
  rating?: number;
  reviewCount?: number;
}

/* ------------------------------------------------------------------ */
/* Village (provisions marketplace)                                    */
/* ------------------------------------------------------------------ */

export type ProvisionCategory =
  | "dairy"
  | "eggs"
  | "honey"
  | "produce"
  | "bakery"
  | "preserves";

export interface Seller {
  id: string;
  slug: string;
  name: Localized;
  about: Localized;
  location: GeoPlace;
  /** omit until there is a real photo — the UI falls back to a monogram */
  photo?: Photo;
}

export interface Provision {
  id: string;
  slug: string;
  sellerId: string;
  category: ProvisionCategory;
  name: Localized;
  description: Localized;
  /** what one unit is, e.g. "1 L jar", "10 eggs" */
  unitLabel: Localized;
  price: Money;
  inStock: boolean;
  photos: Photo[];
  deliveryNote: Localized;
}

/* ------------------------------------------------------------------ */
/* Rent (daily gear & vehicles)                                        */
/* ------------------------------------------------------------------ */

export type RentalCategory =
  | "car"
  | "water"
  | "beach"
  | "camping"
  | "bike";

export interface RentalSpec {
  label: Localized;
  value: Localized;
}

export interface RentalItem {
  id: string;
  slug: string;
  category: RentalCategory;
  name: Localized;
  description: Localized;
  pricePerDay: Money;
  deposit: Money;
  quantity: number;
  delivery: boolean;
  pickupPoint: Localized;
  photos: Photo[];
  specs: RentalSpec[];
}

/* ------------------------------------------------------------------ */
/* Explore (excursions)                                                */
/* ------------------------------------------------------------------ */

export interface Excursion {
  id: string;
  slug: string;
  name: Localized;
  summary: Localized;
  description: Localized;
  durationHours: number;
  pricePerPerson: Money;
  groupMax: number;
  schedule: Localized;
  meetingPoint: Localized;
  photos: Photo[];
  includes: Localized[];
  highlights: Localized[];
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export interface Review {
  id: string;
  /** slug of the property or excursion being reviewed */
  subjectSlug: string;
  author: string;
  /** ISO date */
  date: string;
  rating: number;
  text: Localized;
  /** which unit / room / route they actually booked */
  booked?: Localized;
  /** the owner's public answer, if they left one */
  reply?: Localized;
}

/* ------------------------------------------------------------------ */
/* Booking requests (the only write path in the request-to-book model) */
/* ------------------------------------------------------------------ */

export type BookingKind =
  | "stay-unit"
  | "stay-room"
  | "rental"
  | "excursion"
  | "provision-order";

export type BookingStatus =
  | "new"
  | "confirmed"
  | "declined"
  | "cancelled";

export interface BookingRequestInput {
  kind: BookingKind;
  /** slug of the parent entity (property / rental / excursion / seller) */
  subjectSlug: string;
  /** id of the exact unit / room / item / excursion, when applicable */
  refId?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  quantity?: number;
  name: string;
  email: string;
  phone: string;
  message?: string;
  locale: Locale;
}

export interface BookingRequest extends BookingRequestInput {
  id: string;
  status: BookingStatus;
  createdAt: string;
}
