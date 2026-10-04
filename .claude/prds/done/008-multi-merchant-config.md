# PRD: Multi-Merchant Configuration

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** platform requirement — one codebase, many merchants ("the same feature for another 10 merchants")
**Superseded by:** PRD 012 — the three-layer model (credentials + feature flags + theme) became credentials + theme accent + a content block declaration. The concept map this PRD introduced made *where* a concept lives merchant data; 012 does the same for *which* concepts exist. `accentText` derived from luminance and the brand hex living in merchant config both survive. Shipped as written; not rewritten.

## Overview

Generalize the merchant configuration so that a second merchant is a config file, not a branch in the code. Credentials, metafield key mapping, feature flags and theme accent all move behind one typed object, and a second fictional merchant proves the switch works.

## Goals

- Onboarding a merchant with different metafield keys requires no change to adapter, components or screens
- Feature flags turn capabilities on and off per merchant
- The accent color is the only per-merchant visual override

## Standards Referenced

- `.claude/standards/shopify.md` — multi-merchant strategy, the three layers of variation
- `.claude/standards/design.md` — accent is the only merchant-overridable token
- `.claude/standards/naming.md` — merchant names confined to `config/merchant/`
- `.claude/standards/security.md` — credentials from the environment

## Decisions Referenced

- 2026-09-30 — Merchant variation = credentials + feature flags + theme tokens; merchant names confined to `config/merchant/`

## Quality Gates

- ~~Switching the active merchant changes catalog, enabled features and accent with no other edit~~
  — **partially met.** Enabled features, metafield mapping and accent all change on one edit,
  verified on screen. **The catalogue does not**, because both merchants point at the same dev
  store: the POC has one, and the credentials layer is wired but not exercised. Closing this leg
  needs a second real Shopify store; the code path is unchanged either way, since credentials come
  from the same config object as everything else.
- `grep -ri northstar src/ --exclude-dir=config` returns nothing
- `bash .claude/scripts/check-security.sh` clean

## User Stories

### US-001: Metafield key mapping

As a platform, I want metafield identifiers declared in config so that a merchant using different keys costs one config entry.

**Depends on:** —
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `merchantConfig.metafields` maps each domain concept to `{ namespace, key }`
- [x] The query builds its identifier list from that map instead of a hardcoded array
- [x] The adapter resolves values through the same map, so `acme_fields.fabric_type` lands in `material`
- [x] Northstar's existing `custom.*` keys keep working unchanged
- [x] A concept absent from a merchant's map is simply not requested, and maps to `undefined`

### US-002: Feature flags

As a platform, I want capabilities toggled per merchant so that one codebase serves merchants with different needs.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `features: { winterCollection, productCare, brandStory }` typed in `merchantTypes.ts`
- [x] Every gated section checks the flag **and** the data
- [x] Turning a flag off removes the section with no leftover spacing
- [x] No screen reads a merchant name to decide what to render

### US-003: Theme override

As a merchant, I want my brand color in the app so that it does not look generic.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `merchantConfig.theme.primaryColor` overrides the `accent` token at theme construction
- [x] No other token is merchant-overridable
- [x] Contrast of `accentText` on the overridden accent is checked, not assumed
- [x] Omitting the override falls back to the base theme

### US-004: Second merchant

As the author, I want a second merchant configured so that the claim is demonstrated rather than described.

**Depends on:** US-001, US-002, US-003
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] A second config exists with a different accent, different feature flags and at least one different metafield key
- [x] `getMerchantConfig(merchantId)` resolves the active merchant from a single place
- [x] A `ponytail:` comment states that this map is a local stand-in for a platform endpoint fed by the OAuth install flow
- [x] Switching merchants is one edit and changes the app's identity and capabilities
- [x] If the second merchant has no live Shopify store, the PRD states that its credentials are placeholders and only the config-switch path is demonstrated

## Functional Requirements

- FR-1: Credentials, metafield keys, feature flags and accent all come from merchant config
- FR-2: No conditional anywhere in the codebase branches on a merchant identity
- FR-3: Adding a merchant adds a file and touches nothing else

## Non-Goals

No OAuth, no backend, no merchant admin UI, no runtime merchant switcher in the app, no per-merchant fonts, layouts or navigation, no remote config fetch.

## Technical Considerations

- Building the query from a config map is the one place this block can over-engineer. The map is a flat record; a query builder with its own abstraction layer would cost more than the 50 merchants it claims to serve.
- The second merchant has no real store. That is acceptable and must be stated in the README rather than faked with mock data pretending to be live.
- This is the block that answers the README's final question. Its real deliverable is that the answer becomes "one config entry" and can be shown on screen in under a minute.

## Success Metrics

- Switching the active merchant yields a visibly different app without reading the diff
- The README's "50 merchants" answer points at running code, not a paragraph

## Open Questions

- **Where the active merchant comes from** — **Assumption:** a constant in `config/merchant/index.ts`, since the POC has no login and no tenant routing. The `ponytail:` comment names the production path.

## Resolved Decisions

- **`merchantConfig.metafields` is a flat `Partial<Record<MetafieldConcept, MetafieldIdentifier>>`.**
  `MetafieldConcept` is declared in `merchantTypes.ts` rather than derived from `ProductMetafields`,
  because config sits below the domain and the dependency has to run one way. The query builds its
  identifier list from the map's values; the adapter resolves each concept through the same map.
  No query builder, no abstraction layer — the Technical Considerations named that as the one place
  this block could over-engineer.
- **A concept a merchant omits is never requested.** `Object.values(...).flatMap(...)` drops it from
  the GraphQL document, and the adapter's `find` returns `undefined` — identical to any absent
  metafield, so quick-rule #5 holds without a second code path.
- **`accentText` is derived, not a second override.** `theme.primaryColor` overrides `accent` alone;
  the label color on top of it comes from the accent's WCAG relative luminance (`theme/contrast.ts`).
  A merchant brand color therefore cannot produce an unreadable CTA. Verified on screen, not
  assumed: `#4D7CFE` resolves to the near-black label at 5.3:1, and the base `volt` resolves to the
  same token the theme already shipped, so Northstar is pixel-identical.
- **A merchant's brand hex lives in its config file.** `palette.ts` is the only file allowed a raw
  color literal (quick-rule #9), and that rule governs the *base theme*. A merchant's accent is
  merchant data, not a design token, and `config/merchant/` is exactly where merchant data belongs.
- **The second merchant reuses the live store's credentials, and says so at the import.** The POC
  has one dev store. Faking a catalogue would have been worse than reusing a real one with a
  `ponytail:` comment naming the production path (OAuth install → platform endpoint → same shape).

## Verification

Simulator (iPhone 17, iOS 26.5), the detail screen reached by a temporary `initialRouteName` and a
temporary `contentOffset`, both reverted. One edit — `ACTIVE_MERCHANT_ID` — between the two runs:

| | `northstar` | `atlas` |
|---|---|---|
| Accent | volt, near-black label | blue `#4D7CFE`, near-black label (derived) |
| Winter badge | renders | gone (flag off **and** concept unmapped) |
| `material` | "Organic Cotton" | gone — mapped to `fabric_type`, which this catalogue does not define |
| `promotionText` | "Free shipping above $199" | same, same key |
| Care section | `HOW TO CARE` | `CARE GUIDE` |

Northstar after the refactor is identical to before it — no regression from moving the config.

**Omitted concept, isolated:** a second run set `atlas.features.winterCollection` to **`true`**
while leaving `isWinterCollection` out of its map. The badge still did not render, and `BEST SELLER`
— a concept that *is* mapped — rendered beside it. The product carries `is_winter_collection = true`
in Shopify, so the map omission is the only thing that can suppress it: the identifier never enters
the GraphQL document and the adapter's `find` returns `undefined`. Reverted after the screenshot.

Gates: `grep -ri "northstar\|atlas" src/ --exclude-dir=config` returns nothing;
`bash .claude/scripts/check-security.sh` clean (gitleaks, yarn audit, semgrep).
