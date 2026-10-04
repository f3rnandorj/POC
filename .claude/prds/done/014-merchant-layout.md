# PRD: Merchant Layout

**Status:** done
**Shipped:** 2026-10-03
**Started:** 2026-10-03
**Source:** product decision 2026-10-03 — side by side, two merchants were the same screen in another tone

> Written alongside the implementation rather than before it: the arrangements were specified in
> full by the user, so there was no open design question to resolve first. The one decision that did
> come up mid-build — which merchant gets the gallery — is recorded under Resolved Decisions.

## Overview

PRD 012 made a merchant's **content** their own and PRD 013 made their **palette** their own. What
was left was the arrangement: both stores laid out every screen identically, so a side-by-side demo
read as one app with two tints.

This block adds `merchantConfig.layout` — one choice per screen section, from a closed set the app
already knows how to draw. It is the same split the content blocks use: the app owns the grammar,
the merchant owns the words. A merchant that declares nothing is unchanged, which is why Northstar
did not move.

## Goals

- Two merchants read as two apps in arrangement, not only in color
- A merchant cannot express a layout the renderer cannot draw — the type rejects it
- Adding an arrangement stays a platform change, with code and a verification pass behind it
- Omitting a key is always the base arrangement

## Standards Referenced

- `.claude/standards/design.md` — **rewritten by this block**: the Layout section is new
- `.claude/standards/shopify.md` — the multi-merchant axes restated to include layout
- `.claude/standards/quick-rules.md` — #5 (absent renders nothing), #15 (component size), #11 (simulator is the gate)
- `.claude/standards/frontend.md` — list and screen composition

## Decisions Referenced

- 2026-09-30 — Design identity: a base a merchant tints — extended here from color to arrangement
- 2026-10-02 — PRD 012: the app owns the grammar, the merchant owns the words — the governing principle
- 2026-10-03 — PRD 013: brand palette per merchant, derived tokens never overridable

## Quality Gates

- `npx tsc --noEmit` and `yarn lint` clean
- Both merchants exercised on the one running simulator (quick-rule #11)
- Northstar's arrangement unchanged except for the removed label
- No merchant name and no layout object anywhere outside `config/merchant/`

## User Stories

### US-001: The layout contract

**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `MerchantLayout` declares `featured`, `collections` and `detail` as closed unions
- [x] `MerchantConfig.layout` is `Partial<MerchantLayout>` — a merchant opts in per section
- [x] `merchantLayout` resolves every key once, with the base arrangement as fallback
- [x] No screen reads `merchantConfig.layout` directly; they read the resolved object

### US-002: Featured arrangement

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `single` is one horizontal row — the base, unchanged
- [x] `double` splits the same products across two stacked rows; an odd count leaves the extra on the first
- [x] `double` issues **no** additional query — an arrangement is not a fetch
- [x] An empty second row renders nothing rather than an empty container

### US-003: Collections arrangement

**Depends on:** US-001
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `inline` is the stacked list of wide rows — the base, unchanged, still virtualized
- [x] `horizontal` is one scrolling row of tiles
- [x] `CollectionCard` gains `variant: "row" | "tile"` — a named prop, never a layout object
- [x] The horizontal row renders inside `ListHeaderComponent` and the stacked list receives no data: two scrollers on one axis would fight
- [x] The empty-state note belongs to the stacked arrangement only

### US-004: Detail arrangement

**Depends on:** US-001
**Complexity:** 6/10

**Acceptance Criteria:**
- [x] `single` is the one cover photo — the base, unchanged
- [x] `gallery` is a paged run through `product.images`, with a page indicator
- [x] Selecting a variant pages the gallery; **swiping does not change the variant**
- [x] A variant whose photo is not among the product's own leaves the gallery where it is
- [x] A product with one photo renders no indicator; a product with none keeps the `surface` block
- [x] `onScrollToIndexFailed` is handled — the list lays out before its images resolve

### US-005: The leading row loses its label

**Depends on:** US-002
**Complexity:** 1/10

**Acceptance Criteria:**
- [x] The "Featured" heading is removed, not renamed
- [x] "Collections" stays — it is a real Shopify concept
- [x] The "All products" link keeps its place

### US-006: Atlas arranged differently

**Depends on:** US-002, US-003, US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] Atlas declares `featured: "double"` and `collections: "horizontal"`
- [x] Northstar declares only what its catalogue supports, and is otherwise unchanged
- [x] Switching `ACTIVE_MERCHANT_ID` remains the only edit between the two arrangements

### US-007: Standards and decisions updated

**Depends on:** US-006
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `design.md` gains a Layout section stating the values and the rules
- [x] `shopify.md`'s multi-merchant axes restated to cover theme **and** layout
- [x] `decisions.md` + `decisions-index.md` carry this block's decisions
- [x] `prds/_index.md` updated

## Functional Requirements

- FR-1: Arrangement is merchant data; the set of arrangements is source
- FR-2: Any key a merchant omits falls back to the base
- FR-3: A component that gains a shape gains a named variant, never a layout object
- FR-4: Adding a merchant still touches exactly one file

## Non-Goals

No free-form layout in config, no per-merchant navigation, no per-merchant fonts or density, no
arrangement for a screen this PRD does not name, no reordering of the detail screen's info column.
Free-form layout was considered and rejected on 2026-10-02: it is a page builder, and it leaves
`design.md` with nothing to contract.

## Technical Considerations

- **The containment is the union, not the review.** Values live in the source as a type. A merchant
  cannot write an arrangement the renderer cannot draw, which is what made it safe to let config
  decide layout at all.
- **Each new value multiplies verification.** With two themes and three sections, the combinations
  grow faster than the code does, and this repo has no test layer — the simulator is the gate. That
  is the real cost of a new arrangement, not the component work.
- **The gallery is the one that is a feature, not an arrangement.** It consumes images the app was
  already fetching and discarding since PRD 002, and it carries state, which the other two do not.

## Success Metrics

- The two merchants screenshotted side by side differ in arrangement, palette and content, from one `ACTIVE_MERCHANT_ID` edit
- Northstar's captures differ from the PRD 013 ones only by the removed label and the gallery indicator

## Verification (2026-10-03)

Simulator: iPhone 17, iOS 27.0. Temporary `initialRouteName` + `initialParams` for the detail
screen, reverted after capture.

What was exercised, with the arrangement each merchant carried at capture time:

| | merchant A | merchant B |
|---|---|---|
| `featured` | `single` — one row | `double` — two rows, 4 products split 2+2 |
| `collections` | `inline` — stacked rows | `horizontal` — two tiles |
| `detail` | `gallery` — 6 indicators | `single` |
| Leading label | removed | removed |

Which merchant holds which arrangement is a config line, not a property of this block — it moved
after these captures and will move again. What the captures prove is that **every value renders**,
that an omitted key falls back, and that one `ACTIVE_MERCHANT_ID` edit swaps the whole screen.

**The gallery's one-way sync was proven, not assumed:** with a variant that carries its own photo
forced in a temporary render change, the active indicator moved from the first position to the
fourth on its own. Reverted after the capture.

Gates: `npx tsc --noEmit` clean · `yarn lint` clean · no temporary render change left in the tree.

## Resolved Decisions (2026-10-03)

- **The gallery only pays off where the catalogue has photos.** Atlas's products carry **one** image
  each, while `northstar-essential` carries 6 and `everyday-tee` 4, accumulated by the restyle
  passes. On a single-image catalogue the gallery degrades to a single image with no indicator —
  correct, but invisible. That is a catalogue fact to weigh when assigning the value, not a rule the
  code enforces.
- **One-way sync between variant and gallery.** A variant chip pages the gallery; a swipe does not
  change the variant. Two-way would mean a swipe silently changing which size is in the cart.
- **"Featured" removed rather than renamed.** The `ponytail:` comment already recorded that no
  Shopify concept sits behind it — it was the first N of the catalogue wearing the name of
  curation. A different word keeps the problem.
- **The horizontal collections row lives in the list header.** Nesting a horizontal scroller inside
  the vertical list would put two scrollers on one axis; instead the stacked list receives no data
  when the arrangement is horizontal.
