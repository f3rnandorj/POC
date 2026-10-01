# PRD: Multi-Merchant Configuration

**Status:** draft
**Started:** 2026-10-01
**Source:** platform requirement — one codebase, many merchants ("the same feature for another 10 merchants")

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

- Switching the active merchant changes catalog, enabled features and accent with no other edit
- `grep -ri northstar src/ --exclude-dir=config` returns nothing
- `bash .claude/scripts/check-security.sh` clean

## User Stories

### US-001: Metafield key mapping

As a platform, I want metafield identifiers declared in config so that a merchant using different keys costs one config entry.

**Depends on:** —
**Complexity:** 5/10

**Acceptance Criteria:**
- [ ] `merchantConfig.metafields` maps each domain concept to `{ namespace, key }`
- [ ] The query builds its identifier list from that map instead of a hardcoded array
- [ ] The adapter resolves values through the same map, so `acme_fields.fabric_type` lands in `material`
- [ ] Northstar's existing `custom.*` keys keep working unchanged
- [ ] A concept absent from a merchant's map is simply not requested, and maps to `undefined`

### US-002: Feature flags

As a platform, I want capabilities toggled per merchant so that one codebase serves merchants with different needs.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `features: { winterCollection, productCare, brandStory }` typed in `merchantTypes.ts`
- [ ] Every gated section checks the flag **and** the data
- [ ] Turning a flag off removes the section with no leftover spacing
- [ ] No screen reads a merchant name to decide what to render

### US-003: Theme override

As a merchant, I want my brand color in the app so that it does not look generic.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `merchantConfig.theme.primaryColor` overrides the `accent` token at theme construction
- [ ] No other token is merchant-overridable
- [ ] Contrast of `accentText` on the overridden accent is checked, not assumed
- [ ] Omitting the override falls back to the base theme

### US-004: Second merchant

As the author, I want a second merchant configured so that the claim is demonstrated rather than described.

**Depends on:** US-001, US-002, US-003
**Complexity:** 4/10

**Acceptance Criteria:**
- [ ] A second config exists with a different accent, different feature flags and at least one different metafield key
- [ ] `getMerchantConfig(merchantId)` resolves the active merchant from a single place
- [ ] A `ponytail:` comment states that this map is a local stand-in for a platform endpoint fed by the OAuth install flow
- [ ] Switching merchants is one edit and changes the app's identity and capabilities
- [ ] If the second merchant has no live Shopify store, the PRD states that its credentials are placeholders and only the config-switch path is demonstrated

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
