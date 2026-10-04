# PRD: Merchant Brand Palette

**Status:** done
**Shipped:** 2026-10-03
**Started:** 2026-10-02
**Source:** product decision 2026-10-02 — a second merchant must read as a different brand, not as the same app with another badge color

## Overview

PRD 012 made a merchant's **content** their own: which blocks exist, where they come from, where
they land. Their **look** is still one accent away from identical. `MerchantTheme` is
`{ primaryColor?: string }` and `design.md` states it as a contract — "the accent is the only
per-merchant color" — so Northstar and Atlas differ by one swatch on a near-black app that is itself
named after Northstar.

This block grows the overridable surface from one color to a small, closed set of brand tokens:
`background`, `surface`, `text`, `textMuted`, `border`, plus the existing accent. A merchant can be
light where the base theme is near-black. What stays fixed is everything that is not brand —
`success` and `danger` carry state, not identity, and `accentText` remains derived so no merchant can
produce an unreadable label.

## Goals

- A merchant reads as a different brand at a glance, without a second app or a second theme file
- Omitting an override is byte-identical to today — Northstar does not move a pixel
- An unreadable palette is caught when the config is written, not when someone squints at a screenshot
- The set of overridable tokens stays closed: a merchant tints the app, they do not redesign it

## Standards Referenced

- `.claude/standards/design.md` — the palette section and the "accent is the only per-merchant color" contract; **this block rewrites both**
- `.claude/standards/quick-rules.md` — #9 (tokens only, no raw hex; `palette.ts` is the exception) and #11 (simulator is the gate)
- `.claude/standards/shopify.md` — "Multi-merchant strategy": theme is the second axis beside blocks
- `.claude/standards/architecture.md` — the Config layer row

## Decisions Referenced

- 2026-09-30 — Design identity: streetwear / neutral + one accent — **the "one accent" half is superseded here**
- 2026-10-01 — PRD 008: `accentText` derived from the accent's luminance, not a second override — **preserved and extended**
- 2026-10-01 — PRD 008: a merchant's brand hex lives in its config file, not in `palette.ts` — **preserved**; this block adds more hexes to the same place, it does not add a new exception to quick-rule #9
- 2026-10-02 — PRD 012: the app owns the grammar, the merchant owns the words — the same split applies here: the app owns which tokens exist, the merchant owns their values

## Quality Gates

- `yarn lint` and `npx tsc --noEmit` clean
- Both merchants exercised on the one running simulator (quick-rule #11), including the loading, empty and error states — those are token-driven, so they are the cheapest place for a palette to go wrong unnoticed
- Northstar's screens are visually unchanged from before this PRD
- `bash .claude/scripts/check-security.sh` clean

## User Stories

### US-001: The overridable token set

As a merchant, I want my brand colors in the app so that it reads as mine rather than as the
platform's.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `MerchantTheme` carries optional `background`, `surface`, `text`, `textMuted`, `border` beside the existing `primaryColor`
- [x] `theme.ts` applies each as `merchantConfig.theme.X ?? colors.X` — one expression per token, no loop that would accept a token the app does not own
- [x] `accentText` stays **derived** via `pickContrastText`, never overridable
- [x] `success`, `danger` and `transparent` stay fixed: they carry state and not brand
- [x] A merchant that overrides nothing produces the exact base theme — Northstar is unchanged
- [x] No new raw hex outside `palette.ts` and the merchant config files (quick-rule #9 unchanged)
- [x] The `ColorToken` union is untouched: merchants change token **values**, never the token list

### US-002: Readability guard

As the platform, I want an unreadable merchant palette to fail loudly in development so that a
merchant cannot ship invisible copy.

**Depends on:** US-001
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `contrast.ts` exposes a contrast-ratio function built on the `relativeLuminance` already there — no second luminance implementation
- [x] Theme construction checks, in `__DEV__` only: `text`/`background`, `textMuted`/`background`, `text`/`surface`, `success`/`background`, `danger`/`background`
- [x] A pair below its threshold throws at startup naming the pair and the measured ratio — the same loud-at-startup posture as `requireEnv`
- [x] Thresholds: 4.5:1 for body-sized copy, 3:1 for `success`/`danger`, which carry a word at `caption` size beside a state that is also conveyed by position
- [x] Production builds pay nothing — the check does not run outside `__DEV__`
- [x] `accentText` is not checked: it is derived and cannot fail by construction

> Droppable by decision: if the simulator is preferred as the only gate (quick-rule #11), this US can
> be cut and the risk accepted. It is written separately so cutting it costs nothing elsewhere.

### US-003: Atlas as a light brand

As the author, I want the second merchant to be light where the base is near-black so that the claim
is demonstrated rather than described.

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `atlas.theme` declares a full light palette beside its existing `#4D7CFE` accent
- [x] The accent's derived `accentText` is re-checked on the light background — a blue that worked on near-black is not automatically right
- [x] Northstar keeps `theme: {}` beyond its absent accent, proving the fallback path
- [x] Switching `ACTIVE_MERCHANT_ID` remains the only edit between the two looks

### US-004: Verified on screen, both themes

As the author, I want every state exercised in both palettes, because a token-driven screen fails
silently rather than loudly.

**Depends on:** US-002, US-003
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] Home, Product List, Product Detail captured in both merchants
- [x] The **loading**, **empty** and **error** states captured in the light theme — `ProductDetailFeedback` and `SectionNote` are pure token consumers, so they are where a bad palette hides
- [x] The variant picker's selected/unselected chips and the sold-out treatment are legible in both
- [x] The hairline `border` is still visible on the light surface — a border tuned for near-black is the first token to disappear
- [x] Captures taken by a temporary render change, reverted after, with an app restart (`design.md`)

### US-005: Standards and decisions updated

**Depends on:** US-004
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `design.md` — the palette section rewritten: the token table marks which are merchant-overridable, which are derived and which are fixed; the title stops naming Northstar
- [x] `design.md` — the "Direction" section states that near-black is the **base** identity, not a platform constant
- [x] `shopify.md` — the multi-merchant table's theme row widened from one token to the brand set
- [x] `decisions-index.md` — the 2026-09-30 identity row overwritten (live decisions only, per the 2026-10-02 convention); a new row for this PRD
- [x] `decisions.md` — full text appended; superseded entries left intact (append-only)

## Functional Requirements

- FR-1: A merchant's look is credentials + a closed set of brand tokens + their block list — nothing else
- FR-2: Any token a merchant omits falls back to the base theme
- FR-3: No merchant can override a derived or a state token
- FR-4: Adding a merchant still touches exactly one file

## Non-Goals

No per-merchant fonts, no per-merchant density, radius or grid, no dark/light **mode** toggle (a
merchant has one palette, not two), no runtime theme switching, no gradient support, no per-merchant
component variants. Those were considered and rejected on 2026-10-02: they turn the theme into a
second config DSL and leave `design.md` with nothing left to contract.

## Technical Considerations

- **The risk here is not the override, it is what the override exposes.** Every screen already reads
  tokens and holds no raw color, which is why this change is small — and also why a bad palette
  breaks silently instead of crashing. US-002 and US-004 exist for that, not for the happy path.
- **`border` is the token most likely to vanish.** `graphite` on `ink` is a deliberate near-invisible
  hairline; the same relationship on a light surface needs a different value, not a lighter one.
- **One expression per token, not a spread.** `{ ...colors, ...merchantConfig.theme }` would let a
  merchant introduce a token the app does not own and would silently accept a typo'd key. The
  verbose version is the one that can be read in a diff.
- **The base palette stops being "the Northstar palette".** It is the platform default that a merchant
  who declares nothing inherits. That is a rename in `design.md`, not in code.

## Success Metrics

- The two merchants screenshotted side by side read as two apps, from one `ACTIVE_MERCHANT_ID` edit
- Northstar's captures are indistinguishable from the PRD 012 ones

## Verification (2026-10-03)

Simulator: iPhone 17, iOS 27.0 — the one device already booted. Detail screens reached by a
temporary `initialRouteName` + `initialParams`, reverted after capture. One edit,
`ACTIVE_MERCHANT_ID`, between merchants.

| | `northstar` | `atlas` |
|---|---|---|
| Background | near-black | `#FFF8F0` warm off-white |
| Accent | volt | `#F04E23`, dark label derived at 5.49:1 |
| `text` / `textMuted` | base | 16.75:1 / 5.82:1 on the brand background |
| `success` / `danger` | `mint` / `ember` | `moss` / `clay`, 4.76:1 and 5.16:1 |
| Variant chips | base | selected terracotta, "Sold out" legible |
| Error state | base | `PRODUCT NOT FOUND` legible on cream |

Northstar is pixel-identical to the PRD 012 captures — same badges, same order, same sections.

**What the block actually found:** the hypothesis in the Open Questions below turned out to be the
defect. `mint` reads **1.68:1** on a light background, and the fix could not be a different brand
background, because a light background was the requirement. `success`/`danger` became derived from
the background's luminance — the `accentText` pattern, applied a second time. That is recorded as
an ADR dated 2026-10-03 and written into `design.md` as a token *kind*, not a token list.

Gates: `npx tsc --noEmit` clean · `yarn lint` clean · `check-security.sh` clean.

## Open Questions

- **Whether US-002 ships** — **Assumption:** it does. The project's own culture is "verified on
  screen, not assumed" (PRD 008), and with 50 merchants onboarding without a developer, a screenshot
  is not a gate anyone will run. Cut it if the simulator is to stay the only check.
- **Whether `success`/`danger` eventually need deriving too** — **Resolved 2026-10-03: yes, and
  immediately.** The assumption below was wrong on its first contact with a real palette. "A
  different brand background" was not available as an answer, because the light background *was*
  the requirement. They are derived, not overridable — the merchant still cannot choose a state
  color.
