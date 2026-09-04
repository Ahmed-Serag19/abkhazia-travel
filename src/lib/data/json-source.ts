/**
 * `DataSource` backed by the editable content file.
 *
 * Same interface as the fixture and API sources — the only difference is that
 * an owner can change what it returns.
 */

import type { BookingRequest, BookingRequestInput } from "@/lib/types";
import type { DataSource } from "./index";
import { readContent, writeContent } from "./content-file";
import { propertySummary } from "./summary";

export const jsonSource: DataSource = {
  async listProperties() {
    const { properties } = await readContent();
    return properties.map(propertySummary);
  },
  async getProperty(slug) {
    const { properties } = await readContent();
    return properties.find((p) => p.slug === slug) ?? null;
  },

  async listSellers() {
    return (await readContent()).sellers;
  },
  async getSeller(slug) {
    const { sellers } = await readContent();
    return sellers.find((s) => s.slug === slug) ?? null;
  },

  async listProvisions() {
    return (await readContent()).provisions;
  },
  async getProvision(slug) {
    const { provisions } = await readContent();
    return provisions.find((p) => p.slug === slug) ?? null;
  },

  async listRentals() {
    return (await readContent()).rentals;
  },
  async getRental(slug) {
    const { rentals } = await readContent();
    return rentals.find((r) => r.slug === slug) ?? null;
  },

  async listExcursions() {
    return (await readContent()).excursions;
  },
  async getExcursion(slug) {
    const { excursions } = await readContent();
    return excursions.find((e) => e.slug === slug) ?? null;
  },

  async listReviews(subjectSlug) {
    const { reviews } = await readContent();
    return reviews
      .filter((r) => r.subjectSlug === subjectSlug)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  async createBookingRequest(input: BookingRequestInput) {
    const doc = await readContent();
    const request: BookingRequest = {
      ...input,
      id: `req-${Date.now().toString(36)}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    // The console reads booking requests from this same file, so a guest
    // submitting the form locally shows up in the owner's inbox.
    const persisted = await writeContent({
      ...doc,
      bookingRequests: [request, ...doc.bookingRequests],
    });

    if (!persisted) {
      // Read-only deployment (the POC). The request is not durable, so put the
      // whole thing in the log where it can at least be recovered by hand.
      console.warn(
        "[booking-request] NOT PERSISTED — read-only deployment.",
        JSON.stringify(request),
      );
    }

    return request;
  },
};
