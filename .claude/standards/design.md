# Design identity — base (streetwear / bold basic)

The identity contract. Every UI task executes **inside** these tokens. A new color, font, radius or shadow is an ADR in `memory/decisions.md`, not an inline value. UI skills (impeccable, ui-ux-pro-max) are executors within this identity — they never invent a new one.

## Direction

Reference feel of the base identity: **streetwear / bold basic** (Nike SNKRS, Stüssy). High contrast, absolute black, product photo carrying the screen, type doing the talking. Chrome is minimal: no cards around everything, no decorative borders, no shadows as decoration.

## Palette — a base identity a merchant tints

Semantic tokens (`src/theme/palette.ts` → `src/theme/theme.ts`). The base is near-black; it is the
**platform default a merchant inherits**, not a constant. Each token is one of three kinds, and the
kind is the rule:

| Token | Role | Kind |
|---|---|---|
| `background` | app background | **merchant** |
| `surface` | raised block (variant chip, sheet) | **merchant** |
| `text` | primary copy | **merchant** |
| `textMuted` | secondary copy | **merchant** |
| `border` | hairline, 1px — the only separator | **merchant** |
| `accent` | badge fill, CTA, selected variant | **merchant** (`theme.primaryColor`) |
| `accentText` | copy on top of `accent` | derived from the accent's luminance |
| `success` / `danger` | in stock / sold out | derived from the **background's** luminance |

Rules:

- A merchant overrides values, never the token list. An omitted token falls back to the base.
- **Derived tokens are never overridable.** `accentText` cannot produce an unreadable label, and
  `success`/`danger` pick between two fixed values so a state color tuned for near-black does not
  vanish on a light brand — `mint` reads 1.68:1 on cream, which is what forced the derivation.
- Theme construction **throws in `__DEV__`** when a merchant palette falls below 4.5:1 for copy or
  3:1 for state, naming the pair and the measured ratio. A palette fails by being invisible, so it
  is measured rather than eyeballed.
- No gradient as a brand device, no purple-on-white default, no color introduced at the call site.

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

Spacing scale base 4: `s4 s8 s12 s16 s24 s32`. Screen gutter `s16`, and it goes **inside** the scroller — `screenGutter` in a list's `contentContainerStyle`, never padding on the frame that wraps it, because iOS clips a scroller to its frame and a bleeding row dies there. `sNegative16` is the gutter negated — the one negative token, for a horizontal row that must scroll to the device edge (`marginHorizontal="sNegative16"` plus `paddingHorizontal: 16` on the row's content). Product grid: **2 columns**, `s8` gap. Product Detail sections separated by a single hairline `border` + `s16` above/below — not by cards.

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

## Layout — a closed set of arrangements

A merchant picks how each screen is arranged, from alternatives the app already knows how to draw.
**The arrangement lives inside the screen it belongs to** — `screens.{screen}.layout`, the first key
of that screen, above its areas — and each screen resolves its own (`homeLayout`,
`productDetailLayout`). An omitted key falls back to the base.

| Screen | Key | Values | Base |
|---|---|---|---|
| `home` | `productRow` | `single` — one scrolling row · `double` — two stacked rows, the same products split | `single` |
| `home` | `collections` | `inline` — stacked wide rows · `horizontal` — one scrolling row of tiles | `inline` |
| `productDetail` | `media` | `single` — one cover photo · `gallery` — a paged run through every photo | `single` |

Rules:

- **The values are a union in the source, never a string from config.** A merchant cannot express an
  arrangement the renderer cannot draw; the type rejects it at compile time.
- A component that gains a shape gains a **named variant** (`CollectionCard` `row` | `tile`), never a
  layout object at the call site.
- `double` splits the products it already has — an arrangement is not a second query.
- Two scrollers on one axis fight: the horizontal collections row renders inside the list header and
  the stacked list receives no data, rather than being nested.
- **A new screen brings its own `layout`.** There is no central map of arrangements to extend: the key lives with that screen's areas, which is what keeps a screen's declaration readable as one thing.
- A new value here is a **platform** change — it ships code and a verification pass for every
  merchant — not a merchant change.

## Validation

Mobile profile: a screen counts as done when it was exercised on **the simulator already running** — one device, period. Never boot a second simulator, never install the build on another model, never ask for a device matrix: not for a width named in a PRD gate, not for a "small screen check". A layout that only holds at one width is a layout bug, caught by forcing long content on the device at hand. A PRD that names a specific width (`375pt`) is naming an intent, not a device — satisfy it with long content here. Overflow and clipped badge text still mean not done.

Driving the screen for a screenshot is a **temporary render change** — a `initialRouteName`, a `initialParams`, a `contentOffset` — reverted right after; never a synthetic cursor event. After that edit, **restart the app** (`simctl terminate` + `launch`): fast refresh preserves React Navigation's state, so a new initial route is not re-evaluated and the simulator keeps showing the old screen. The same restart is what clears a leftover temporary route once it is reverted. Long-content check: a 3-line product title and a 200-char promo text must not push the CTA off screen.
