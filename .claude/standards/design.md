# Design identity — Northstar (streetwear / bold basic)

The identity contract. Every UI task executes **inside** these tokens. A new color, font, radius or shadow is an ADR in `memory/decisions.md`, not an inline value. UI skills (impeccable, ui-ux-pro-max) are executors within this identity — they never invent a new one.

## Direction

Reference feel: **streetwear / bold basic** (Nike SNKRS, Stüssy). High contrast, absolute black, product photo carrying the screen, type doing the talking. Chrome is minimal: no cards around everything, no decorative borders, no shadows as decoration.

## Palette — neutral + one accent

Semantic tokens (`src/theme/palette.ts` → `src/theme/theme.ts`). The **accent is the only per-merchant color** — `merchantConfig.theme.primaryColor` overrides it and nothing else.

| Token | Role |
|---|---|
| `background` | app background — near-black |
| `surface` | raised block (variant chip, sheet) |
| `text` | primary copy — near-white on dark |
| `textMuted` | secondary copy: material, promo text |
| `border` | hairline, 1px — the only separator |
| `accent` | merchant primary — badge fill, CTA, selected variant |
| `accentText` | copy on top of `accent` |
| `success` / `danger` | availability in stock / sold out |

Rules: no gradient as a brand device, no purple-on-white default, no color introduced at the call site.

## Typography — geometric sans, wide scale

One family (Inter or Satoshi), wide title-to-body jump. Variants in `theme.textVariants`:

| Variant | Use |
|---|---|
| `displayLarge` | product title on detail — 32/36, weight 700, tight tracking |
| `titleMedium` | section heading (`HOW TO CARE`) — 14, weight 700, uppercase, letter-spacing +1 |
| `priceLarge` | price — 24, weight 700, tabular |
| `body` | description, material, promo — 15/22 |
| `caption` | availability, helper — 12 |
| `badge` | badge label — 11, weight 700, uppercase, letter-spacing +1 |

Uppercase is a **variant**, never `.toUpperCase()` in a component.

## Density — compact

Spacing scale base 4: `s4 s8 s12 s16 s24 s32`. Screen gutter `s16`. Product grid: **2 columns**, `s8` gap. Product Detail sections separated by a single hairline `border` + `s16` above/below — not by cards.

Radius: **one** scale — `s2` (4) for chips and buttons, `s4` (8) for image containers. Nothing rounder. Shadow scale: **none** (elevation is contrast, not shadow).

## Badge — the identity primitive

`ProductBadge` is the component the whole POC is graded on. One visual treatment, driven only by `text`:

- `accent` fill, `accentText` label, `badge` variant, `s8`/`s4` padding, `s2` radius.
- Self-aligning (`alignSelf="flex-start"`) — never stretches.
- **Returns `null` on falsy text.** No skeleton, no placeholder, no reserved space.

A second badge variant (outline) is allowed only when two badges must coexist on one product, and it is declared in the theme, not at the call site.

## Anti-"AI look" checklist

- Palette from the tokens above — never the default purple-gradient.
- **No emoji as an icon or section heading.** The README's `⭐ BEST SELLER` is prose describing a badge, not a spec: render the badge, not the star glyph.
- Layout rhythm varies — the Product Detail is image → title → price → badge → metadata → description → sections, not six identical cards.
- ONE radius scale, ONE (empty) shadow scale. Mixed scales = drift.
- Loading, empty and error states are designed with this identity: type + accent, no spinner-on-white, no library default.

## Validation

Mobile profile: a screen counts as done when it was exercised on **the simulator already running** — one device, period. Never boot a second simulator, never install the build on another model, never ask for a device matrix: not for a width named in a PRD gate, not for a "small screen check". A layout that only holds at one width is a layout bug, caught by forcing long content on the device at hand. A PRD that names a specific width (`375pt`) is naming an intent, not a device — satisfy it with long content here. Overflow and clipped badge text still mean not done.

Driving the screen for a screenshot is a **temporary render change** — a `initialRouteName`, a `initialParams`, a `contentOffset` — reverted right after; never a synthetic cursor event. After that edit, **restart the app** (`simctl terminate` + `launch`): fast refresh preserves React Navigation's state, so a new initial route is not re-evaluated and the simulator keeps showing the old screen. The same restart is what clears a leftover temporary route once it is reverted. Long-content check: a 3-line product title and a 200-char promo text must not push the CTA off screen.
