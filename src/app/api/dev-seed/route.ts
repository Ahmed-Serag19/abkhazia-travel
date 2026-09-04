import { NextResponse } from "next/server";
import {
  excursions,
  properties,
  provisions,
  rentals,
  sellers,
} from "@/lib/data/fixtures";
import { reviews } from "@/lib/data/reviews";
import {
  contentFilePath,
  readContent,
  writeContent,
  type ContentDoc,
} from "@/lib/data/content-file";

/**
 * Writes the hard-coded fixtures into the editable content file.
 *
 * Run once to create `data/content.json`, or with `?force=1` to reset the file
 * back to the shipped seed data. Refuses to overwrite existing content
 * otherwise — this endpoint would happily destroy an owner's edits.
 *
 * Development only.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  const force = new URL(req.url).searchParams.get("force") === "1";
  const existing = await readContent();
  const hasContent =
    existing.properties.length > 0 ||
    existing.rentals.length > 0 ||
    existing.provisions.length > 0;

  if (hasContent && !force) {
    return NextResponse.json(
      {
        error: "already_seeded",
        message:
          "content.json already has data. Pass ?force=1 to overwrite it with the shipped fixtures.",
        file: contentFilePath(),
      },
      { status: 409 },
    );
  }

  const doc: ContentDoc = {
    version: 1,
    updatedAt: new Date().toISOString(),
    properties,
    sellers,
    provisions,
    rentals,
    excursions,
    reviews,
    // keep any requests already collected — they are not fixture data
    bookingRequests: existing.bookingRequests,
  };

  await writeContent(doc);

  return NextResponse.json({
    ok: true,
    file: contentFilePath(),
    counts: {
      properties: doc.properties.length,
      sellers: doc.sellers.length,
      provisions: doc.provisions.length,
      rentals: doc.rentals.length,
      excursions: doc.excursions.length,
      reviews: doc.reviews.length,
      bookingRequests: doc.bookingRequests.length,
    },
  });
}
