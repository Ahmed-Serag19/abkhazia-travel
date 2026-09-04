/**
 * Lists message keys that exist in the Russian source but not in a translation.
 *
 * `src/i18n/request.ts` deep-merges every locale over `ru.json`, so a missing
 * key renders Russian instead of crashing. That is the right runtime
 * behaviour, but it also means an untranslated string is invisible until
 * somebody reads the page — which is exactly how "Аренда авто" shipped on the
 * English /cars page. This makes the gap visible.
 *
 *   node scripts/i18n-check.js          list gaps
 *   node scripts/i18n-check.js --strict exit 1 if any exist (for CI)
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "messages");
const SOURCE = "ru";

function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, full, out);
    } else {
      out[full] = value;
    }
  }
  return out;
}

const read = (locale) =>
  JSON.parse(fs.readFileSync(path.join(DIR, `${locale}.json`), "utf8"));

const source = flatten(read(SOURCE));
const locales = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"))
  .filter((l) => l !== SOURCE);

let gaps = 0;

for (const locale of locales) {
  const target = flatten(read(locale));

  const missing = Object.keys(source).filter((k) => !(k in target));
  // a key that is present but byte-identical to the Russian is almost always
  // a copy-paste placeholder rather than a real translation
  const untranslated = Object.keys(source).filter(
    (k) => k in target && target[k] === source[k] && /[Ѐ-ӿ]/.test(String(source[k])),
  );
  const orphaned = Object.keys(target).filter((k) => !(k in source));

  gaps += missing.length + orphaned.length;

  console.log(`\n=== ${locale} ===`);
  console.log(`  missing:      ${missing.length}`);
  console.log(`  same as ru:   ${untranslated.length}`);
  console.log(`  not in ru:    ${orphaned.length}`);

  if (missing.length) {
    console.log("\n  MISSING (renders Russian to the visitor):");
    for (const k of missing) console.log(`    ${k}  =  ${JSON.stringify(source[k])}`);
  }
  if (orphaned.length) {
    console.log("\n  NOT IN SOURCE (dead key, safe to delete):");
    for (const k of orphaned) console.log(`    ${k}`);
  }
}

if (process.argv.includes("--strict") && gaps > 0) {
  console.error(`\n${gaps} translation gaps.`);
  process.exit(1);
}
