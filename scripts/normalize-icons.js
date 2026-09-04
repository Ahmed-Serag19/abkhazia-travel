/**
 * Normalise the category-icon PNGs.
 *
 * Generated renders come out with the subject small in the middle of a big
 * canvas — lots of empty margin baked in. `object-cover` in the tile then
 * fills with that margin, so the object looks tiny and off-centre.
 *
 * This trims the dead border and re-squares each one at 600×600 so the
 * subject actually fills its frame, centred.
 *
 *   1. drop the untouched exports in  assets/icon-sources/<key>.png
 *   2. from the project root:  node scripts/normalize-icons.js
 *
 * The sources live outside `public/` on purpose — they are ~2 MB each and
 * would otherwise ship to the CDN for no reason. `assets/` is the source of
 * truth; re-run this any time you replace an export.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "public", "icons");
const SOURCES = path.join(__dirname, "..", "assets", "icon-sources");
const KEYS = ["stay", "village", "cars", "rent", "explore"];
const SIZE = 600;

(async () => {
  for (const key of KEYS) {
    const src = path.join(DIR, `${key}.png`);
    const original = path.join(SOURCES, `${key}.png`);
    if (!fs.existsSync(original)) {
      console.log(`skip ${key}: no assets/icon-sources/${key}.png`);
      continue;
    }

    const input = fs.readFileSync(original);
    const meta = await sharp(input).metadata();
    const hasAlpha = !!meta.hasAlpha;

    let trimmed;
    try {
      trimmed = await sharp(input)
        .trim({ threshold: hasAlpha ? 1 : 30 })
        .toBuffer();
    } catch {
      trimmed = input;
    }
    const tm = await sharp(trimmed).metadata();

    // transparent cut-out -> fit the whole subject in the square, centred, the
    //   rest transparent so the tile's cream shows through
    // opaque photo -> fill the square, centre-crop the overflow
    const out = await sharp(trimmed)
      .resize(SIZE, SIZE, {
        fit: hasAlpha ? "contain" : "cover",
        position: "centre",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(src, out);
    const dim = await sharp(out).metadata();
    console.log(
      `${key}: ${meta.width}x${meta.height} → trim ${tm.width}x${tm.height} → ` +
        `${dim.width}x${dim.height} (alpha=${hasAlpha}, ${(out.length / 1024) | 0}KB)`,
    );
  }
})();
