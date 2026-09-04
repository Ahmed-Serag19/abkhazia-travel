/**
 * Derived views over a `Property`. Kept out of `index.ts` so the individual
 * data sources can use them without importing the barrel (which imports them
 * back).
 */

import type { Money, Property, PropertySummary } from "@/lib/types";

export function propertySummary(p: Property): PropertySummary {
  const prices: Money[] =
    p.kind === "compound"
      ? p.units.map((u) => u.pricePerNight)
      : p.rooms.map((r) => r.pricePerPerson);
  const from = prices.reduce((a, b) => (b.amount < a.amount ? b : a), prices[0]);
  return {
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    name: p.name,
    tagline: p.tagline,
    location: p.location,
    cover: p.photos[0],
    fromPrice: from,
    priceUnit: p.kind === "compound" ? "night" : "person",
    rating: p.rating,
    reviewCount: p.reviewCount,
  };
}

/** Cheapest bookable price on a property, whichever mode it is. */
export function fromPriceOf(property: Property): Money {
  return property.kind === "compound"
    ? property.units.reduce((a, u) =>
        u.pricePerNight.amount < a.pricePerNight.amount ? u : a,
      ).pricePerNight
    : property.rooms.reduce((a, r) =>
        r.pricePerPerson.amount < a.pricePerPerson.amount ? r : a,
      ).pricePerPerson;
}
