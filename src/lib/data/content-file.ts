/**
 * The editable content file.
 *
 * One JSON document holds everything the owner console can change. The guest
 * site reads it; the console reads *and writes* it. It lives in this repo
 * because this is where content belongs — the console resolves it by relative
 * path (or `CONTENT_FILE`).
 *
 * THIS IS THE INTERIM STORE. It works because both apps run on one machine.
 * When Supabase lands, `jsonSource` is replaced by a Drizzle-backed source
 * behind the same `DataSource` interface and this file goes away — the shape
 * below is deliberately the same shape the tables will have.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  BookingRequest,
  Excursion,
  Property,
  Provision,
  RentalItem,
  Review,
} from "@/lib/types";

export interface ContentDoc {
  /** bumped by hand if the shape ever changes and needs a migration */
  version: 1;
  updatedAt: string;
  properties: Property[];
  sellers: import("@/lib/types").Seller[];
  provisions: Provision[];
  rentals: RentalItem[];
  excursions: Excursion[];
  reviews: Review[];
  bookingRequests: BookingRequest[];
}

/**
 * Deliberately a plain `path.join` of string literals, and deliberately NOT
 * configurable by env var.
 *
 * The bundler statically analyses filesystem calls to decide what to ship with
 * the serverless functions. A path it cannot resolve — anything reached through
 * `process.env` — makes it give up and trace the *entire project*, which drags
 * all 16 MB of `public/` into every function bundle and eventually trips
 * Vercel's size limit. Keeping this literal scopes the trace to `data/`.
 *
 * The owner console still needs to point at this file from its own directory;
 * it has its own `CONTENT_FILE` override, and it is never deployed.
 */
const CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

export function contentFilePath(): string {
  return CONTENT_PATH;
}

export const EMPTY_CONTENT: ContentDoc = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  properties: [],
  sellers: [],
  provisions: [],
  rentals: [],
  excursions: [],
  reviews: [],
  bookingRequests: [],
};

/* ------------------------------------------------------------------ */
/* read, with an mtime-keyed cache                                     */
/* ------------------------------------------------------------------ */

let cache: { mtimeMs: number; doc: ContentDoc } | null = null;

/**
 * Read the content file. Cached until the file's mtime changes, so an edit
 * made in the console shows up on the next request without a restart, but a
 * busy page doesn't re-parse the JSON for every component.
 */
export async function readContent(): Promise<ContentDoc> {
  let mtimeMs: number;
  try {
    mtimeMs = (await fs.stat(CONTENT_PATH)).mtimeMs;
  } catch {
    // no file yet — the seed route hasn't been run
    return EMPTY_CONTENT;
  }

  // an in-memory write on a read-only deployment wins over the file on disk
  if (volatile.doc) return volatile.doc;
  if (cache && cache.mtimeMs === mtimeMs) return cache.doc;

  const raw = await fs.readFile(CONTENT_PATH, "utf8");
  const doc = JSON.parse(raw) as ContentDoc;
  cache = { mtimeMs, doc };
  return doc;
}

/**
 * A deployed build has a read-only filesystem, so the content file can be read
 * but never written. Anything that would have been written is held in memory
 * for the life of the instance and logged, so it is recoverable from the
 * platform logs rather than silently dropped.
 */
export function isReadOnlyDeployment(): boolean {
  return Boolean(process.env.VERCEL) || process.env.CONTENT_READONLY === "1";
}

/** Writes that could not be persisted, so this instance still behaves sanely. */
const volatile: { doc: ContentDoc | null } = { doc: null };

/**
 * Write the content file atomically — temp file then rename, so a reader can
 * never catch a half-written document.
 *
 * On a read-only deployment this keeps the change in memory instead of
 * throwing, and returns `false` so the caller knows it did not persist.
 */
export async function writeContent(doc: ContentDoc): Promise<boolean> {
  const next: ContentDoc = { ...doc, updatedAt: new Date().toISOString() };

  if (isReadOnlyDeployment()) {
    volatile.doc = next;
    cache = { mtimeMs: -1, doc: next };
    return false;
  }

  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });

  const tmp = `${CONTENT_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, CONTENT_PATH);

  cache = null;
  return true;
}
