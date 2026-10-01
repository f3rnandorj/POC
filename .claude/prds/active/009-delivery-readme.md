# PRD: Delivery — README and Demo

**Status:** draft
**Started:** 2026-10-01
**Source:** README — "O que você deve documentar" (5 questions) + "Critério de sucesso" §5

## Overview

The POC's written deliverable. The README answers the five required questions, states what was deliberately excluded, and carries the demo script. Scoring criterion 5 is explicitly about technical communication, which makes this block part of the work, not paperwork after it.

## Goals

- All five required questions answered from what was actually built
- The exclusions are framed as decisions with reasons, not as gaps
- A 5-minute demo runs from a written script without improvisation

## Standards Referenced

- `.claude/standards/shopify.md` — the Storefront-vs-Admin rationale, multi-merchant strategy
- `.claude/memory/decisions.md` — the ADRs that justify each answer

## Decisions Referenced

- Every ADR in `memory/decisions.md` — this block converts them into prose for an external reader

## Quality Gates

- A reader who has never seen the repo can run the app from the README alone
- Every claim in the README is true of the committed code
- The demo script was rehearsed once, end to end, against the simulator

## User Stories

### US-001: Shopify section

As a reviewer, I want to know how the app connects to Shopify so that I can judge the integration.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] How the connection was made (Headless channel, public Storefront token, scopes restricted to three)
- [ ] Why Storefront API and not Admin API — the token lives on an untrusted device
- [ ] Why GraphQL — one request shapes the whole Product Detail
- [ ] Where the queries live and why they are isolated
- [ ] The API version pin and the reason for pinning

### US-002: Metafields section

As a reviewer, I want to know how custom data was modeled so that I can judge the merchant-customization story.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] How the definitions were created, including the Storefront access requirement and why it is the most common onboarding failure
- [ ] How they are queried — explicit identifiers, positional array, `null` per undefined identifier
- [ ] How absence is handled — adapter emits `undefined`, component returns `null`
- [ ] Why `value` is always a string and where it is converted

### US-003: Architecture section

As a reviewer, I want the data flow drawn so that I can follow a value from Shopify to the screen.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] The flow diagram: Shopify → client → queries → adapter → domain model → React Query → UI
- [ ] What each layer may and may not do
- [ ] Why the domain barrel does not export the service
- [ ] Why there is no repository interface — one transport
- [ ] Why there is no test suite, stated as a decision with its verification method

### US-004: Multi-client section

As a reviewer, I want the 50-merchant answer so that I can judge platform thinking.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] The three layers of variation: credentials, feature flags, theme tokens
- [ ] What a new merchant costs — one config file
- [ ] What would not fit the three layers and why that becomes a platform feature flagged off
- [ ] How merchant credentials would arrive in production (app install / OAuth), and why that is out of scope here

### US-005: Production section

As a reviewer, I want the exclusions listed so that scope discipline is visible.

**Depends on:** US-001, US-002, US-003, US-004
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] OAuth and server-side credential storage, with the webhook that revokes on uninstall
- [ ] Checkout, cart, auth, orders
- [ ] Error monitoring, analytics, automated tests, CI/CD, store deployment
- [ ] Each item says why it was excluded, not merely that it was
- [ ] The list matches the README's "O que NÃO fazer" and adds nothing that was secretly built

### US-006: Demo script

As a candidate, I want a rehearsed 5-minute walkthrough so that the demo lands.

**Depends on:** US-005
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] Written beat by beat: onboarding → data discovery → list → detail → metafields → absent case → incoming request → the one-line change
- [ ] Includes the closing statement from the README's success criterion 5
- [ ] Names what to show on screen at each beat
- [ ] Rehearsed once end to end; anything that broke is fixed in its own PRD, not patched here

## Functional Requirements

- FR-1: The README answers all five required sections
- FR-2: Setup instructions work from a clean clone
- FR-3: No claim in the README is unsupported by the code

## Non-Goals

No architecture diagrams beyond ASCII, no screenshots gallery, no video production, no Portuguese/English duplication of the whole document.

## Technical Considerations

- The README is written for a reviewer who has not seen the repo and will read it before running anything. It is not written for the author.
- Everything needed for it already exists in `memory/decisions.md`. This block translates ADRs into prose; it does not re-litigate them.
- If writing an answer reveals the code does not support it, the code is wrong — fix it in the owning PRD and come back.

## Success Metrics

- A reviewer can clone, run and understand the architecture without asking a question
- The demo fits in 5 minutes with time to spare

## Open Questions

- **README language** — **Assumption:** written in English, matching the merchant-request quotes in the brief and the component/code naming. Switch if the interview is conducted in Portuguese.
