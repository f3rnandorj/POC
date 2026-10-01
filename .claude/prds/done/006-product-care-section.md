# PRD: Product Care Section

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** README — CASE 5 "Mini tarefa de Forward Deployment" (`care_instructions`)

## Overview

The second unplanned merchant request, arriving as a Slack message: products carrying a `care_instructions` metafield show a "How to care" section below the description, and products without it show nothing. Unlike PRD 005, this one introduces a structured (JSON) metafield and a reusable section component.

## Goals

- The section renders for products that define the field
- The section is absent — not empty — for products that do not
- The component that renders it is generic enough for the next merchant's "ingredients" or "sizing" section

## Standards Referenced

- `.claude/standards/shopify.md` — metafield contract, `json` parsing inside try/catch
- `.claude/templates/metafield-feature.md`
- `.claude/standards/design.md` — section rhythm, `titleMedium` uppercase variant
- `.claude/standards/security.md` — `JSON.parse` on merchant data is always guarded

## Decisions Referenced

- 2026-09-30 — Adapter owns parsing; a parse failure yields `undefined`, never a throw that kills the screen

## Quality Gates

- A product with the field shows the section; a product without it shows the description and nothing after
- A deliberately malformed JSON value in the admin does not crash the screen
- Exercised with long care copy (two values over 100 chars) — **on the one running simulator**, not on a 375pt device: the gate names an intent, and quick-rule #11 forbids a second device

## User Stories

### US-001: Create and populate the metafield

As a merchant, I want care instructions stored in Shopify so that the app can display them.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `custom.care_instructions` defined in the Shopify admin, type JSON
- [x] **Storefront API access enabled** on the definition
- [x] Populated on Northstar Essential with `washing` and `drying` keys
- [x] Left empty on Everyday Tee
- [x] Verified by curl before any app code is written — 2026-10-01: Northstar Essential
  returns `type: "json"` with the value as a **string**, Everyday Tee returns `null`.

### US-002: Query and parse

As a developer, I want the structured value mapped into the domain model so that the UI receives plain fields.

**Depends on:** US-001
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] The identifier is added to the existing metafield selection — one line
- [x] `ProductMetafields.careInstructions?: { washing?: string; drying?: string }`
- [x] `JSON.parse` wrapped in try/catch inside the adapter
- [x] Malformed JSON → `undefined`, no throw, screen still renders
- [x] A present object with only `washing` maps with `drying` undefined

### US-003: Generic section component

As a platform, I want a reusable titled section so that the next merchant's extra section costs nothing new.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `components/ProductSection/ProductSection.tsx` takes `title: string` and a list of `{ label, value }` items
- [x] Items with a falsy value are dropped
- [x] **Returns `null` when no item survives** — the section header never renders alone
- [x] `titleMedium` uppercase variant for the heading, hairline separator above
- [x] Name and props carry no mention of care, washing or the merchant

### US-004: Wire it into the detail screen

As a user, I want care instructions below the description so that I know how to handle the product.

**Depends on:** US-002, US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] Rendered below the description, separated by a hairline
- [x] Gated by `merchantConfig.features.productCare`
- [x] Northstar Essential shows `HOW TO CARE` with Washing and Drying
- [x] Everyday Tee ends at the description — no header, no separator, no gap
- [x] A product with only `washing` shows one row, not an empty Drying row

## Functional Requirements

- FR-1: Section renders only when at least one care value exists
- FR-2: A malformed value degrades to absent, never to a crash
- FR-3: The section component is reusable for any future titled label/value block

## Non-Goals

No rich text, no icons per care type, no localization of the labels, no editing from the app, no care data on the list screen.

## Technical Considerations

- This is the block that proves the architecture. If it needs more than: one identifier line, one adapter mapping, one generic component and one render line, the earlier blocks were built wrong and the fix belongs upstream, not here.
- A JSON metafield is merchant-authored free-form data. It is untrusted input: parse defensively and never render it in a WebView.
- The label keys (`washing`, `drying`) are the merchant's. A different merchant may use other keys — PRD 008 handles that through config; this block hardcodes the two the README specifies and says so.

## Success Metrics

- Implementation time under 30 minutes given PRDs 002-004 shipped
- The same `ProductSection` could render a hypothetical "Ingredients" block with no edit

## Open Questions

- **Unknown keys in the JSON** — **Assumption:** only `washing` and `drying` are read, per the README. Extra keys are ignored rather than rendered generically, because label ordering and copy would then be merchant data the POC does not model.

## Resolved Decisions

- `ProductSection` takes `title` + `{ label, value }[]`, drops empty items and returns `null`
  when none survives — the heading and its hairline never render alone. Nothing in its name or
  props mentions care, washing or the merchant.
- `readJson` lives in the adapter with try/catch. Merchant JSON is untrusted free-form text;
  a malformed value degrades to an absent section.
- The feature flag resolves next to the data (`features.productCare ? careInstructions :
  undefined`), so the screen never wraps the component in a conditional.
- `washing`/`drying` are hardcoded, as this PRD's Technical Considerations instruct. Merchants
  with different keys are PRD 008 — the user's deferral, not the model's.
- **Gate rewritten mid-block.** The original "Exercised at 375pt" sent the model to boot a second
  simulator. The user stopped it and made one-device validation a hard rule in the project and in
  the brain. See the ADR of 2026-10-01 "Um simulador, nunca uma matriz de devices".

## Verification

Simulator (iPhone 17, iOS 26.5) — temporary `initialRouteName` and a temporary `contentOffset`
to reach the section, both reverted:

- `northstar-essential` → `HOW TO CARE` with Washing and Drying, hairline above, section rhythm
  matching the existing dividers
- `everyday-tee` → description, then the next hairline. No header, no separator of its own, no gap
- malformed value (`{"washing": broken`) → screen renders in full, section absent, no crash
- `{"washing": ...}` only → one row, no empty Drying
- `features.productCare: false` → section gone, layout identical to the absent case
- long copy (two values over 100 chars) → wraps to 3 lines each, no clipping, CTA still fixed

## Known Issue (out of scope, pre-existing)

Scrolled far enough, the floating `BackControl` overlaps the product title — it is absolutely
positioned over the `ScrollView` and the content passes under it. It belongs to PRD 003's back
control, not to this block, and was left untouched.
