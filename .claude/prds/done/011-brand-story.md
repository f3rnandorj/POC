# PRD: Brand Story Metaobject

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** brief — "Bônus opcional / Metaobject", a `Brand Story` metaobject (title, description, image) fetched from Shopify and shown on Home
**Generalized by:** PRD 012 — the metaobject type and its field keys now come from a `story` block, so a merchant whose fields are `heading`/`copy`/`hero` needs no adapter edit. The `reference`-not-`value` rule for the image is unchanged. Shipped as written; not rewritten.

## Overview

The last Shopify content type the POC has not touched. A metaobject is merchant-authored content that is **not attached to a product**, so it exercises a part of the Storefront API the metafield work never reached: a standalone record, fetched by type, with a media reference that has to be resolved.

Scheduled as a bonus: nothing depends on it, and it must not disturb anything already shipped.

## Goals

- The Home screen shows the merchant's brand story when the metaobject exists
- It shows nothing at all when it does not — no heading, no divider, no gap
- The metaobject type is config, not a literal, exactly like a metafield identifier

## Standards Referenced

- `.claude/standards/shopify.md` — metafield/metaobject contract, Storefront access requirement
- `.claude/templates/shopify-domain.md` — the domain scaffold
- `.claude/standards/design.md` — section rhythm on Home

## Decisions Referenced

- 2026-10-01 — PRD 008: merchant-specific Shopify identifiers live in `merchantConfig`, resolved through a map
- 2026-09-30 — Adapter owns parsing; absent means `undefined`, component returns `null`

## Quality Gates

- With the metaobject absent, Home is byte-for-byte the Home that shipped in PRD 007
- With it present, the story renders with title, body and image
- `features.brandStory: false` hides it regardless of the data
- An image-less metaobject still renders its text

## User Stories

### US-001: Metaobject definition

As a merchant, I want a Brand Story record in Shopify so that the app can show it.

**Depends on:** —
**Complexity:** 1/10

**Acceptance Criteria:**
- [x] A `Brand Story` metaobject definition exists with `title`, `description` and `image` fields
- [x] **Storefront API access enabled** on the definition — without it the query returns an empty list and no error
- [x] One entry published
- [x] Verified by curl before any app code is trusted

### US-002: Domain through the same pipeline

As a developer, I want the metaobject mapped into a domain model so that the UI receives plain fields.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `domain/BrandStory/` scaffolded from `templates/shopify-domain.md`
- [x] The metaobject **type** comes from `merchantConfig.metaobjects`, never a literal in the query
- [x] The adapter indexes `fields` by key — the array is flat and order is not a contract
- [x] The image arrives through the field's `reference` on `MediaImage`, resolved in the adapter
- [x] A missing field yields `undefined`; an absent metaobject yields `undefined`, not a throw
- [x] `useBrandStoryGetDetail` is the only React Query entry point

### US-003: Generic story component

As a platform, I want a reusable story block so that the next merchant's "About" section costs nothing new.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `components/StoryCard/StoryCard.tsx` takes `title`, `body` and an optional `image`
- [x] Returns `null` when neither title nor body is present
- [x] Renders text-only when the image is absent, with no reserved space
- [x] Name and props mention no merchant and no "brand story"

### US-004: On the Home screen

As a user, I want the brand story on Home so that the app says something about who I am buying from.

**Depends on:** US-002, US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] Rendered as the Home list footer, below the collections
- [x] Gated by `merchantConfig.features.brandStory` **and** the data
- [x] Flag off or metaobject absent → Home is unchanged from PRD 007
- [x] No navigation, no screen and no existing component is modified beyond the one render line

## Functional Requirements

- FR-1: The story renders only when the metaobject exists and the flag is on
- FR-2: The metaobject type is merchant config
- FR-3: Absence is silent, like every other merchant content in this app

## Non-Goals

No rich text rendering, no dedicated story screen, no multiple stories, no story on the product detail, no editing from the app.

## Technical Considerations

- `metaobjects(type:)` returns an empty list for both "the definition does not exist" and "it exists but Storefront access is off". The two are indistinguishable from the device, which is exactly why the admin step is US-001 and gets verified by curl.
- A metaobject field holding a file is a **reference**, not a URL. The raw `value` is a gid; only `reference { ... on MediaImage { image { url } } }` yields something renderable.
- This block is a bonus. If it threatens anything already shipped, it is dropped rather than patched around.

## Success Metrics

- Home with the metaobject absent is indistinguishable from the Home that shipped in PRD 007
- Adding the story introduced no new layer, hook pattern or folder convention

## Open Questions

- **Where on Home** — **Assumption:** the list footer, closing the page. The brief says "show it on Home" and nothing more; a footer keeps the commercial content (featured, collections) above the narrative.

## Resolved Decisions

- **The metaobject type lives in `merchantConfig.metaobjects`**, a `Partial<Record<MetaobjectConcept,
  string>>` alongside the metafield map from PRD 008. Same rule, same shape: a merchant who names
  the type differently is a config entry, and one who has no story at all omits the key and never
  issues the request.
- **Both gates resolve in the useCase, not in the screen.** `features.brandStory` off and "type not
  configured" collapse into the same `undefined`, so the query is disabled and `StoryCard` owns the
  empty case — the screen passes data and never wraps the component in a conditional.
- **The image comes from `reference`, not from `value`.** A metaobject file field carries a gid in
  `value`; only `reference { ... on MediaImage { image { url } } }` yields something renderable. The
  adapter resolves it, so nothing above the adapter knows a gid exists.
- **`StoryCard` is generic.** `title` / `body` / optional `image`, returns `null` when title and body
  are both absent. Nothing in its name or props mentions a brand, a story or a merchant.

## Verification

Simulator (iPhone 17, iOS 26.5). The card normally closes the Home list, so reaching it for a
screenshot used a temporary hoist into `ListHeaderComponent` — `contentOffset` does not work here,
because the list is empty on first layout and the offset is clamped to zero. Reverted after.

- **Metaobject absent** (before the admin step): Home identical to the one that shipped in PRD 007 —
  no hairline, no heading, no gap.
- **Metaobject present**: 16:9 image, `NORTHSTAR STORY` heading (uppercase from the variant, the
  stored value is title case), body wrapping to 5 lines in `textMuted`. The trailing newline Shopify
  stored in `description` is absorbed by the adapter's trim.
- **Image absent**: heading sits directly under the hairline, no reserved space.
- Live payload confirmed by curl first: `brand_story` / handle `northstar-story`, three fields, image
  resolved through `reference`.

## Note for the demo

The first photo was light on a near-black layout and read as a bright panel closing the Home. The
merchant swapped it for a dark one in the admin, and the section now settles into the identity
instead of fighting it — **no code change, no release**, which is the whole point of putting the
content in a metaobject.
