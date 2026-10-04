# PRD: Merchant Content Blocks

**Status:** done
**Shipped:** 2026-10-02
**Started:** 2026-10-02
**Source:** architectural review 2026-10-02 — the concept vocabulary leaked the first merchant
**Supersedes:** `done/008-multi-merchant-config.md` (the three-layer variation model)

## Overview

PRD 008 made **where** a concept lives in Shopify into merchant data: `material` can be
`custom.material` or `acme.fabric_type` and the app does not care. It left **which** concepts exist
in code — `MetafieldConcept` is a closed union of five, `features` and `labels` are required
booleans and strings named after them, and `ProductDetailScreen` places each one by hand. Those five
are exactly what was configured in the Northstar admin, so a merchant with `fit_guide` or
`sustainability_score` costs a type edit, an adapter edit and a screen edit — a deploy per merchant.

This block replaces the concept vocabulary with a **content block** declaration. Each merchant
declares a list of blocks; a block says where its data lives in Shopify, how to parse it, which
presentation primitive renders it, in which slot and in what order. The app owns the grammar — the
block kinds, the slots, the parsing, the primitives. The merchant owns the words — which blocks
exist, their source, their labels, their placement.

The diff is negative: `MetafieldConcept`, `MerchantFeatures`, `MerchantLabels`, `ProductMetafields`
and the per-concept wiring in the detail screen all collapse into one iteration.

## Goals

- Onboarding a merchant whose metafields the app has never seen requires **zero** source edits
- A capability a merchant did not buy is a block absent from their list, not a `false` flag they are
  forced to declare
- The last hardcoded merchant copy (`'Washing'` / `'Drying'` in the detail screen) moves to config
- Block kind + slot pairs that cannot render are rejected at compile time, not on a merchant's screen

## Standards Referenced

- `.claude/standards/shopify.md` — multi-merchant strategy and the metafield contract; **this block
  rewrites both sections**
- `.claude/standards/architecture.md` — the layer table's Config row ("Must NOT: Logic") and the
  folder structure; config gains a declaration, not logic, and the row needs restating
- `.claude/standards/quick-rules.md` — #5 (absent renders nothing) is preserved and strengthened;
  #7 (new metafield = config + adapter + component) **tightens** to config alone
- `.claude/standards/code-style.md` — main export first, singleton objects last, no inline helpers;
  its Types example names `ProductMetafields` and needs the one-word swap
- `.claude/standards/design.md` — accent stays the only merchant-overridable token
- `.claude/templates/metafield-feature.md` — the 5 edits collapse into a single config entry
- `.claude/templates/shopify-domain.md` — its `{domain}Types.ts` example carries the dead
  `ProductMetafields` shape

## Decisions Referenced

- 2026-09-30 — Merchant variation = credentials + feature flags + theme tokens — **superseded here**
- 2026-09-30 — Metafields queried by explicit identifier; adapter owns parsing; absent → `undefined`
  → component returns `null` — **preserved**, the resolution point moves
- 2026-10-01 — PRD 008: metafield becomes a `concept → {namespace,key}` map — **superseded here**
- 2026-10-01 — PRD 005: a badge row conditional for layout only, because an empty flex row still
  consumes the column's `gap` — the renderer owning absence removes the conditional
- 2026-10-01 — PRD 006: `readJson` with try/catch, because merchant JSON is untrusted input
- 2026-10-01 — PRD 011: metaobject image comes from `reference`, never `value`

## Quality Gates

- `yarn lint` passes (the only gate and the only formatter, quick-rule #21)
- `yarn ios` on the one running simulator (quick-rule #11) — never a second device
- Both merchants exercised by the single `ACTIVE_MERCHANT_ID` edit, with **disjoint block sets**
- `grep -ri "northstar\|atlas" src/ --exclude-dir=config` returns nothing
- `grep -rn "winterCollection\|careInstructions\|promotionText\|isWinterCollection" src/ --exclude-dir=config`
  returns nothing — no concept name survives outside merchant config
- `bash .claude/scripts/check-security.sh` clean

## User Stories

> Next US = first in document order with all `Depends on` complete (every AC `[x]`).

### US-001: Block declaration in config

As a platform, I want each merchant to declare a list of content blocks so that the set of concepts
is merchant data instead of a union in the source.

**Depends on:** —
**Complexity:** 6/10

**Acceptance Criteria:**
- [x] `merchantTypes.ts` declares `ContentBlock` as a **discriminated union on `kind`**, each member
      carrying only the slots that kind can render into — an illegal pair is a type error
- [x] Block kinds: `badge`, `textLine`, `labelValueSection`, `story`
- [x] Slots: `detailBadgeRow`, `detailUnderPrice`, `detailAboveDescription`,
      `detailBelowDescription`, `homeFooter`
- [x] Every block carries `id`, `order`, an optional `label`, and a `source`
- [x] `source` is `{ from: 'metafield', namespace, key, as: 'text' | 'boolean' | 'json' }` or
      `{ from: 'metaobject', type, fields }`
- [x] A `labelValueSection` with a `json` source declares `fields: { key, label }[]` — the row labels
      are merchant data, not screen constants
- [x] `MetafieldConcept`, `MerchantMetafieldMap`, `MerchantMetaobjectMap`, `MerchantFeatures` and
      `MerchantLabels` are deleted
- [x] `merchantConfig.ts` is unchanged: `ACTIVE_MERCHANT_ID`, `getMerchantConfig` and the
      `ponytail:` note about the platform endpoint all survive as-is
- [x] Northstar's five existing blocks are declared and render identically to before this PRD

### US-002: Query built from the block list

As a platform, I want the GraphQL identifier list derived from the blocks so that a source the
merchant did not declare is never requested.

**Depends on:** US-001
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `buildMetafieldIdentifiers` iterates `merchantConfig.blocks`, keeping only metafield sources
- [x] Two blocks pointing at the same metafield emit **one** identifier (deduped by
      `namespace:key`)
- [x] A merchant with no metafield blocks produces a valid document, not `identifiers: []`
- [x] No `metaobject` source leaks into the product fragment

### US-003: Adapter resolves blocks

As a platform, I want the adapter to resolve declared blocks into rendered-ready content so that
parsing stays in the one layer that owns it.

**Depends on:** US-002
**Complexity:** 7/10

**Acceptance Criteria:**
- [x] `Product.metafields: ProductMetafields` becomes `Product.content: ProductContent`, a
      `Partial<Record<Slot, ResolvedBlock[]>>`
- [x] `ResolvedBlock` is a union on `kind` carrying only rendered values — `{ kind: 'badge', text }`,
      `{ kind: 'textLine', text }`, `{ kind: 'labelValueSection', title, items }`
- [x] **A block whose source is absent produces no entry at all** — quick-rule #5 now holds in the
      adapter as well as in each component
- [x] `as: 'boolean'` + `kind: 'badge'` renders `block.label` when the value is `'true'`, and nothing
      otherwise — this is the winter badge, now generic
- [x] `as: 'json'` keeps the `try/catch`; a malformed value yields no block, never a throw
- [x] An empty or whitespace-only string is an absent value (existing `readText` behavior)
- [x] Blocks within a slot are ordered by `order`, ties falling back to declaration order
- [x] A slot whose blocks all resolved absent is **omitted from `content`**, not present as `[]`

### US-004: Slot-driven detail screen

As a platform, I want the detail screen to render slots instead of named concepts so that a new
block needs no screen edit.

**Depends on:** US-003
**Complexity:** 6/10

**Acceptance Criteria:**
- [x] A new `ContentBlocks` component maps `ResolvedBlock[]` to the existing primitives and returns
      `null` for an empty or `undefined` array
- [x] `ContentBlocks` takes the layout from its caller (`direction="row"` for the badge row) — it
      does not infer layout from the blocks it received
- [x] `ProductDetailScreen` reads no concept by name and reads no `features` flag
- [x] The badge row's layout-only conditional is **removed**: `ContentBlocks` returning `null` is
      what stops the empty flex row from eating the column's `gap` (PRD 005's finding, now
      structural)
- [x] `ProductBadge`, `ProductSection` and `StoryCard` are **not modified**
- [x] `ProductMetadata` deleted in favor of `ContentBlocks` rendering `textLine` directly — once the
      renderer owned the line and its absence, the wrapper had nothing left to own (removed with the
      user's explicit approval, 2026-10-02)
- [x] The screen's visual output for Northstar is unchanged from before this PRD

### US-005: The story block drives BrandStory

As a merchant, I want my metaobject's own field names to work so that the brand story is not tied to
`title` / `description` / `image`.

**Depends on:** US-001
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `brandStoryAdapter` reads field keys from the story block's `source.fields` instead of three
      hardcoded strings
- [x] `useBrandStoryGetDetail` gates on **the story block's presence**, not `features.brandStory`;
      no block means the query never fires (`enabled` stays false)
- [x] The image still resolves through `reference`, never `value` (PRD 011)
- [x] `null` still crosses the React Query cache for "this store has no story" — v5 rejects
      `undefined` as data
- [x] `HomeScreen`'s footer is driven by the resolved story, with no feature flag read
- [x] The `story` kind is declared in `blocks` but resolved by the BrandStory domain, not by
      `productAdapter` — it is a separate query, and this asymmetry is stated in a comment

### US-006: Atlas proves a disjoint block set

As the author, I want the second merchant to declare concepts the first does not so that the claim
is demonstrated rather than described.

**Depends on:** US-004, US-005
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] Atlas declares at least one block whose concept does **not** exist in Northstar's list
      (e.g. a `fit_guide` `labelValueSection`), proving a new concept costs no source edit
- [x] Atlas declares **no** winter badge block — the capability leaves no trace, and no
      `winterCollection: false` is written anywhere
- [x] Atlas declares **no** story block, and the Home footer renders nothing
- [x] Atlas places a block in a different slot than Northstar does, exercising the slot field
- [x] Atlas keeps its `#4D7CFE` accent and the derived `accentText`
- [x] The `ponytail:` comment about reusing the live store's credentials survives
- [x] Switching `ACTIVE_MERCHANT_ID` is still the only edit between the two runs

### US-007: Standards and decisions updated

As the author, I want the written standards to match the shipped model so that the next change is
not made against a superseded rule.

**Depends on:** US-006
**Complexity:** 3/10

> **Last by decision (2026-10-02):** code ships first, docs close the block. The PRD is the spec in
> the meantime. Verified before choosing: quick-rule #7 as written does not block anything US-001 to
> US-006 does, so `pre-edit-validate.sh` stays out of the way. The cost accepted is that stopping
> mid-PRD leaves `.claude/` describing the old model while the code is already the new one.

**Acceptance Criteria:**
- [x] `shopify.md` — "Multi-merchant strategy (50 merchants, one app)" rewritten around blocks; the
      metafield contract's rule 4 restated; the `ProductMetafields` snippet replaced by
      `ProductContent`
- [x] `architecture.md` — the Config row restated (declares content, still no logic) and the folder
      structure updated
- [x] `quick-rules.md` #7 tightened: a new metafield is **one config entry**; touching a type, the
      adapter or a screen means the *kind* is missing, which is a platform change and not a merchant
      one
- [x] `templates/shopify-domain.md` — the `{domain}Types.ts` example drops the `ProductMetafields`
      shape and carries `content: ProductContent` instead
- [x] `code-style.md` — the domain-prefixed naming example on the Types list swaps
      `ProductMetafields` for `ProductContent` (one word; the rule itself is unaffected)
- [x] `metafield-feature.md` — **rewritten thin, not deleted.** The 5 edits collapse into one ("add
      the block"), and the file survives for the part that was never a step: the pre-flight that the
      metafield exists in the admin **and is published to the Storefront API** ("most of these
      requests die there"), plus the `Done when` checklist. The 5-minute test's answer becomes "add a
      block to each merchant's list"
- [x] `decisions-index.md` — the two superseded rows are **overwritten in place** by the new
      decisions, with no supersession marker left behind. The index is auto-loaded on every prompt
      and stays short; `git log` is where the three-layer model's existence is recorded
- [x] `decisions.md` — this PRD's `Resolved Decisions` appended. **The superseded entries' full text
      is left intact** — it loads only on `adr|decisão|por que decid` prompts, so it costs nothing in
      the hot path, and removing it would be deleting written reasoning rather than tidying an index
- [x] `done/008-multi-merchant-config.md` carries `**Superseded by:** 012`
- [x] `done/005-winter-collection-badge.md`, `done/006-product-care-section.md` and
      `done/011-brand-story.md` each carry a one-line note that the mechanism described was
      generalized by 012 — they shipped as written and are not rewritten, only annotated
- [x] `prds/_index.md` gains the 012 row (done at authoring, per `_index.md` step 5)

## Functional Requirements

- FR-1: The set of renderable concepts is merchant data; the set of block kinds and slots is source
- FR-2: A merchant's block list fully determines what is queried, parsed and rendered
- FR-3: Adding a merchant adds one config file and touches nothing else
- FR-4: Adding a *concept* to an existing merchant adds one array entry and touches nothing else
- FR-5: No concept name, label or merchant name exists outside `src/config/merchant/`

## Non-Goals

No remote config fetch, no OAuth, no merchant admin UI, no runtime merchant switcher, no new block
kind beyond the four, no per-merchant fonts or navigation, no new slot on a screen this PRD does not
already touch, no JSON-schema validation layer for the config file.

## Technical Considerations

- **The config becomes a layout declaration. That is a deliberate, accepted risk.** The alternative
  — the app fixing every slot — was considered and rejected on 2026-10-02: the merchant can now move
  a section above the description without a deploy. The containment is that `kind` and `slot` are
  closed unions in the app and paired in a discriminated union, so the only arrangements expressible
  are ones the app can actually render. A merchant cannot invent a slot, a kind, or an illegal pair.
- **`order` collisions cost one line, not a validation branch.** `Array.prototype.sort` is stable, so
  sorting by `order` alone makes duplicates fall back to declaration order and an out-of-range number
  is simply a position. No normalization pass, no fallback table.
- **Two different trust levels, and only one of them is a boundary.** The config file is ours: typed,
  compiled, a type error if wrong. The metafield *values* are the merchant's, arriving as strings
  from their admin — that is the boundary, and `readText` / `readBoolean` / `readJson` already guard
  it. When config eventually arrives as JSON from the platform endpoint (the `ponytail:` note in
  `merchantConfig.ts`), the config itself becomes untrusted and needs its own parse. Out of scope
  here, and the note should say so.
- **The compile-time type of a JSON metafield is lost, and that is a correction not a regression.**
  `careInstructions?: { washing?, drying? }` asserted a shape over a merchant-authored string; it
  never guaranteed one. The block's `fields` declaration replaces the assertion with the merchant
  stating which keys they actually filled.
- **This is the block that makes PRD 008's 5-minute test pass trivially.** "The client wants the same
  feature for another 10 merchants" stops being "add the identifier to the fragment and flip the
  flag" and becomes "add a block to each merchant's list".
- The diff is expected to be **net negative** in lines. A growing diff means a kind or a slot is
  being invented that no merchant asked for — stop and cut it.

## Success Metrics

- A concept that exists in neither merchant today can be added to one of them by editing a single
  array, verified on the simulator, with `git diff --stat` touching one file
- `grep` for any of the five old concept names outside `config/merchant/` returns nothing
- Switching the active merchant yields two visibly different screens with different *sections*, not
  just different keys and a different accent

## Resolved Decisions (2026-10-02)

- **Config decides slot and order, not just membership.** Chosen over the app fixing the layout and
  over a slot-only middle ground. The merchant can rearrange a product page without a deploy; the
  app contains the blast radius by pairing `kind` and `slot` in a discriminated union, so the type
  system rejects what the renderer cannot draw.
- **A per-store adapter module was rejected.** The literal reading of "an adapter per store" means
  50 modules to ship and a deploy per onboarding. One adapter reading the store's declaration
  delivers the same thing with no per-store code. If a genuinely irregular store ever needs real
  logic, the door is a `parse?` function on the block — not a module, and not until a store needs it.
- **Feature flags are deleted rather than made `Partial`.** A flag and a block were always the same
  statement made twice; the Atlas config proved it by carrying
  `features.winterCollection: false` beside a `labels.winterCollection` that could never render.
  Block absence says it once.
- **`isWinterCollection` stops being a special case.** It was one metafield consuming a concept, a
  flag and a label to express "one more badge, conditionally". As a `badge` block with a `boolean`
  source and a `label`, it is indistinguishable from any other badge — which is the point: it was
  never a platform concept, it was one merchant's campaign with an API name.
- **Code ships before the standards are rewritten.** US-007 is last. The alternative — documenting
  the block model first and coding against it — was rejected because `.claude/` is the project's
  source of truth and is auto-loaded every prompt: a standard describing code that does not exist
  yet misroutes the next prompt, which is worse than a standard that is briefly behind.
- **A superseded ADR row is overwritten, not marked.** `decisions-index.md` enters context on every
  prompt, so it carries live decisions only; the three-layer model's existence lives in `git log` and
  in the untouched full text in `decisions.md`.
- **Shipped PRDs are annotated, never rewritten.** 005, 006, 008 and 011 each gain one line pointing
  at 012. They are dated records of what was delivered that day — a reader who opens 006 to
  understand the care section should not be misled, and should also not find the history edited.

## Open Questions

- **Where `'Washing'` / `'Drying'` end up** — **Assumption:** on the block's `fields` as
  `{ key: 'washing', label: 'Washing' }`, since the JSON keys are already the merchant's and the
  labels should travel with them. No separate label map.
- **Whether `ProductMetadata` survives** — **Resolved 2026-10-02:** deleted, with the user's explicit
  approval. Once `ContentBlocks` renders a `textLine` and owns its absence, the wrapper had nothing
  left to own.

## Verification (2026-10-02)

Simulator: iPhone 17, iOS 27.0 — the one device already booted (quick-rule #11). The detail screen
was reached by a temporary `initialRouteName` + `initialParams` on `AppStack`, reverted after the
captures; never by a synthetic input event. One edit, `ACTIVE_MERCHANT_ID`, between the two merchants.

**The gate was blocked first, by a defect this PRD did not cause.** The app built and installed
cleanly, then died at launch with `EXC_BREAKPOINT` in
`__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`: iOS 26+ terminates any app that has
not adopted the UIScene lifecycle, and React Native 0.87 still ships the classic
`UIApplicationDelegate` + `UIWindow` template. It would have crashed the same way on `main`. Fixed
under this PRD by the user's explicit request — see the ADR dated 2026-10-02.

| | `northstar` | `atlas` |
|---|---|---|
| Accent | volt, near-black label | blue `#4D7CFE`, derived near-black label |
| Badge row | `BEST SELLER` + `WINTER COLLECTION` | `BEST SELLER` alone |
| Winter badge | renders (boolean source + block label) | gone — Atlas declared no winter block |
| Material line | "Organic Cotton" | gone — mapped to `fabric_type`, undefined in this catalogue |
| Promotion line | "Free shipping above $199" | same, same key |
| Care section | `HOW TO CARE`, **below** the description, rows `Washing` / `Drying` | `CARE GUIDE`, **above** the description, rows `Wash` / `Dry` |
| Fit guide | not declared | declared, absent — the catalogue has no `fit_guide` |
| Home footer | Northstar story with image | nothing, no trailing space |

Northstar after the refactor is identical to before it — same badges in the same order, same two
metadata lines, same care section with the same labels. No regression from moving the vocabulary out
of the code.

**Absent case, isolated:** `everyday-tee` defines none of the five metafields. The screen renders
title, price, divider and description only — no badge row, no metadata line, no section heading, no
`undefined`, and no gap where any of them would have been. The slots are missing from `content`
entirely rather than present as empty arrays, which is what removed the layout conditional the screen
used to need.

**The slot field is doing real work:** the care section moved from below the description to above it
with no code change, only Atlas declaring a different slot.

Gates: `npx tsc --noEmit` clean · `yarn lint` clean · `bash .claude/scripts/check-security.sh` clean
(gitleaks, yarn audit, semgrep) · `grep -ri "northstar\|atlas" src/ --exclude-dir=config` empty ·
`grep -rn "winterCollection\|careInstructions\|promotionText\|isWinterCollection" src/` empty.

## Resolved Decisions (2026-10-02)

- **Config decides slot and order, not just membership.** Chosen over the app fixing the layout and
  over a slot-only middle ground. The merchant can rearrange a product page without a deploy; the
  app contains the blast radius by pairing `kind` and `slot` in a discriminated union, so the type
  system rejects what the renderer cannot draw.
- **A per-store adapter module was rejected.** The literal reading of "an adapter per store" means
  50 modules to ship and a deploy per onboarding. One adapter reading the store's declaration
  delivers the same thing with no per-store code. If a genuinely irregular store ever needs real
  logic, the door is a `parse?` function on the block — not a module, and not until a store needs it.
- **Feature flags are deleted rather than made `Partial`.** A flag and a block were always the same
  statement made twice; the Atlas config proved it by carrying
  `features.winterCollection: false` beside a `labels.winterCollection` that could never render.
  Block absence says it once.
- **`isWinterCollection` stops being a special case.** It was one metafield consuming a concept, a
  flag and a label to express "one more badge, conditionally". As a `badge` block with a `boolean`
  source and a `label`, it is indistinguishable from any other badge — which is the point: it was
  never a platform concept, it was one merchant's campaign with an API name.
- **Code ships before the standards are rewritten.** US-007 is last. The alternative — documenting
  the block model first and coding against it — was rejected because `.claude/` is the project's
  source of truth and is auto-loaded every prompt: a standard describing code that does not exist
  yet misroutes the next prompt, which is worse than a standard that is briefly behind.
- **A superseded ADR row is overwritten, not marked.** `decisions-index.md` enters context on every
  prompt, so it carries live decisions only; the three-layer model's existence lives in `git log` and
  in the untouched full text in `decisions.md`.
- **Shipped PRDs are annotated, never rewritten.** 005, 006, 008 and 011 each gain one line pointing
  at 012. They are dated records of what was delivered that day — a reader who opens 006 to
  understand the care section should not be misled, and should also not find the history edited.

## Open Questions

- **Where `'Washing'` / `'Drying'` end up** — **Assumption:** on the block's `fields` as
  `{ key: 'washing', label: 'Washing' }`, since the JSON keys are already the merchant's and the
  labels should travel with them. No separate label map.
- **Whether `ProductMetadata` survives** — **Resolved 2026-10-02:** deleted, with the user's explicit
  approval. Once `ContentBlocks` renders a `textLine` and owns its absence, the wrapper had nothing
  left to own.

## Blocked — simulator gate (2026-10-02)

The four remaining ACs all need the app on screen, and **the app cannot launch on this machine for a
reason unrelated to this PRD**. `yarn ios` builds and installs cleanly (exit 0), then the process
dies instantly with `EXC_BREAKPOINT` in
`__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`.

iOS 26+ terminates at launch any app that has not adopted the UIScene lifecycle. `ios/Fuego/Info.plist`
has no `UIApplicationSceneManifest` and `AppDelegate.swift` is the classic
`UIApplicationDelegate` + `UIWindow` template React Native 0.87 still ships. The only installed
simulator runtime is iOS 27.0, so there is no older device to fall back to — and this would crash the
same way on `main`, before a line of PRD 012 existed.

**It is therefore a separate defect, not a result of this block**, and fixing it is a native startup
change (scene manifest + a scene delegate that owns the window) well outside this PRD's scope. The
code gates that do not need a device all pass: `tsc`, `yarn lint`, `check-security.sh`, and both
grep gates.

**Still open, pending a launchable app:**
- Northstar's blocks render identically to before this PRD
- The detail screen's visual output for Northstar is unchanged
- Switching `ACTIVE_MERCHANT_ID` is the only edit between the two runs
- Atlas's Home footer renders nothing
