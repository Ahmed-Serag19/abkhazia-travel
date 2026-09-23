/**
 * Stable UUIDs for content that was authored with readable ids.
 *
 * The fixtures and `data/content.json` identify things as `prop-ahmad-farm`,
 * `unit-ahmad-cedar`, `seller-ripa` — written by hand, and good that way. The
 * tables use `uuid` primary keys, which is right for rows an owner will later
 * create from a form.
 *
 * Rather than pick one and rewrite the other, seeding derives a **UUIDv5**
 * from the readable id. It is a pure function of the name, so:
 *
 *   - re-seeding produces the same ids and updates rows in place instead of
 *     duplicating them;
 *   - foreign keys (provision → seller, unit → property) resolve without
 *     keeping a lookup table between runs;
 *   - a booking request whose `refId` points at `unit-ahmad-cedar` still
 *     points at the same row after the content file is re-imported.
 *
 * The namespace is a fixed random UUID — it only has to be constant, never
 * secret.
 */

import { createHash } from "node:crypto";

const NAMESPACE = "7d3f6a5e-2b41-4c8a-9f0d-6e1b2c3d4a5f";

function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex.replace(/-/g, ""), "hex");
}

/** RFC 4122 §4.3 — name-based UUID using SHA-1. */
export function stableId(name: string): string {
  const hash = createHash("sha1")
    .update(hexToBytes(NAMESPACE))
    .update(name, "utf8")
    .digest();

  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

/**
 * Ids that are already UUIDs pass through untouched, so content created by
 * the owner console (which inserts real UUIDs) survives a re-seed.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toRowId(id: string): string {
  return UUID_RE.test(id) ? id.toLowerCase() : stableId(id);
}
