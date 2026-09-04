# Category icons

The five home-page tiles (`Stay`, `From the village`, `Cars`, `Rent items`,
`Explore`) each show one 3D-rendered object — the icon **is** the picture, in
the style of Airbnb's "services near you" tiles.

## Files

`CategoryShowcase.tsx` loads `/icons/<key>.<ext>`, where `<key>` is one of:

| key | tile |
|---|---|
| `stay` | Stay |
| `village` | From the village |
| `cars` | Cars |
| `rent` | Rent items |
| `explore` | Explore |

The `.png` files here are the **live set** (generated Sept 2026).
`CategoryShowcase.tsx` loads them via `next/image`, so the multi-MB originals
are served resized (~40–100 KB each). The old `.svg` Fluent-Emoji placeholders
are kept only as a fallback reference.

### Consistency notes for a future re-roll

The current set is good but not perfectly uniform:

- `stay.png`, `village.png` — clean cut-outs on transparent. Ideal.
- `cars.png`, `rent.png` — a faint dark studio vignette rather than transparent.
- `explore.png` — a **photograph** of a compass on a map, not an isolated
  render, so it reads with a different texture from the rest.

If you regenerate, add to the `cars` / `rent` / `explore` prompts:
`plain white or transparent background, isolated single object, no scene, no
table, no vignette` — and keep everything else identical to the block below.

## Regenerating

Generated renders arrive with the subject floating in a big empty canvas, so
they need one processing pass or they look tiny and off-centre in the tile:

1. drop the raw exports into **`assets/icon-sources/`** (`stay.png` … `explore.png`)
2. from the project root: `node scripts/normalize-icons.js`

That trims the dead margin and re-squares each one to 600×600 so the object
fills its frame. Nothing in `CategoryShowcase.tsx` changes.

The sources live in `assets/` rather than here because anything under
`public/` ships to the CDN, and the untouched exports are ~2 MB each.

### Generator recipe (semi-realistic, Airbnb-style)

Run all five in one session. Keep the **style block identical** every time and,
if the tool supports it, lock a **style reference / seed** so the set matches.

**Style block — paste after each subject:**

```
, single object, semi-realistic 3D product render, soft matte materials with
subtle real texture (brushed metal, matte plastic, worn wood, ceramic),
physically-based shading, gentle three-point studio lighting, soft realistic
contact shadow, very shallow depth of field, object floating centred on a plain
transparent background, slight three-quarter top-down camera, no text, no
ground plane, no scene, Airbnb 3D icon style, warm neutral palette,
high detail, 512x512, 1:1, octane render
```

**Negative prompt:** `flat, cartoon, sticker, emoji, glossy toy, low-poly,
outline, illustration, hard drop shadow, busy background`

**Subjects:**

| key | subject |
|---|---|
| `stay` | a small stone-and-timber coastal cottage with a terracotta tiled roof and one warmly lit window |
| `village` | a glass jar of amber honey beside a woven basket with a few brown eggs and a glass milk bottle |
| `cars` | a clean compact SUV, three-quarter front view, subtle reflections on the paint |
| `rent` | a stand-up paddleboard leaning against a folded wooden beach table with a closed canvas sun umbrella |
| `explore` | a worn brass pocket compass resting on a partly rolled paper map |

Each object must still read clearly at ~56 px — it is a tile, not a hero shot.

**No time to generate?** Grab matching objects from a photoreal 3D asset
library (Shapefest, iconscout 3D, or the paid IconScout "3D illustrations"
packs) and drop the PNGs in with the same names.
