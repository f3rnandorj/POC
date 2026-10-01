# PRD: Project README and Demo

**Status:** draft
**Started:** 2026-10-01
**Scope note:** the README is a **general project document** — what the app is, how it works, how to run it. Nothing is handed in and nothing is being answered.
**Reference shape:** the author's own `buzzvel-challenge` repo README (https://github.com/f3rnandorj/buzzvel-challenge) — About / Technologies / Requirements / How to Run / Project Structure / Key Features / How to Use / Contact.

## Overview

A README anyone can land on cold and understand: what the app is, which stack it runs on, how to get it running, how the code is laid out, and what it deliberately does not do. It is written for a developer visiting the repo.

## Goals

- A reader with no context knows what the project is within the first paragraph
- A developer gets the app running on a simulator from the README alone, Shopify setup included
- The architecture is legible without opening files
- Exclusions read as scope decisions

## Standards Referenced

- `.claude/standards/shopify.md` — Storefront-vs-Admin rationale, metafield definitions, multi-merchant strategy
- `.claude/standards/architecture.md` — the layer rules the structure section describes
- `.claude/memory/decisions.md` — the ADRs behind each "why" sentence

## Decisions Referenced

- Every ADR in `memory/decisions.md`, condensed to one sentence each where the README needs a "why". The README does not re-litigate them and does not reproduce them in full.

## Quality Gates

- A fresh clone reaches a running app following only the README
- Every claim in the README is true of the committed code
- No section assumes the reader knows anything about where the project came from

## User Stories

### US-001: Header and About

As a visitor, I want to know what this project is and see it working so that I can decide whether to read further.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] Title, one-paragraph description: a React Native storefront POC reading live Shopify data, where merchant-specific product content arrives as metafields
- [ ] Stack badges (TypeScript, React Native, React Query, Restyle, GraphQL)
- [ ] A screenshot or short screen recording of list → detail
- [ ] A link to the APK, or the line stating builds are produced locally
- [ ] Contact block: email, LinkedIn

### US-002: Technologies

As a visitor, I want the stack listed with reasons so that I can judge the choices.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] One bullet per dependency actually in `package.json`, each with what it does here — React Native CLI, TypeScript, React Navigation, TanStack Query v5, `@shopify/restyle`, `react-native-config`, Shopify Storefront GraphQL
- [ ] No library listed that the project does not use
- [ ] Says there is no test layer and why, in one sentence, without hedging

### US-003: Requirements and How to Run

As a developer, I want to run the app so that I can see it work.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] Prerequisites: Node version, yarn, Xcode / Android Studio, Ruby + bundler for Pods
- [ ] Clone → `yarn` → `yarn pods` → `yarn ios` / `yarn android`, verified from a clean clone
- [ ] `.env` setup from `.env.example`: which Storefront variables exist and where to get each one
- [ ] Shopify side: Headless channel, the public Storefront token, the three scopes, and the metafield definitions **with Storefront access enabled** — flagged as the step that silently breaks the app when skipped
- [ ] How to build the APK that gets shared

### US-004: Project Structure

As a developer, I want the layout annotated so that I can find things.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] Annotated tree of `src/`: `api`, `components`, `config/merchant`, `domain`, `infra`, `routes`, `screens`, `theme`, `utils`
- [ ] The data flow in one diagram: Shopify → client → `{domain}Queries` → adapter → domain model → useCase hook → UI
- [ ] What each layer may and may not do, including that the domain barrel exports useCases and types but never the service
- [ ] Where a new screen, a new component and a new metafield each go

### US-005: Key Features

As a visitor, I want the interesting parts called out so that I do not have to find them myself.

**Depends on:** US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] Product list and detail with variants and availability
- [ ] Merchant content through metafields: explicit identifiers queried positionally, `null` per undefined identifier, adapter emits `undefined`, component renders nothing — no placeholder, no dash
- [ ] Generic components only: merchant identity lives in `merchantConfig`, never in a component name
- [ ] Multi-merchant config: the three layers of variation (credentials, feature flags, theme tokens) and what a new merchant costs
- [ ] Themed with Restyle tokens, no raw hex anywhere

### US-006: How to Use and Out of Scope

As a visitor, I want to know what to click and where the project stops.

**Depends on:** US-005
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] A short walkthrough of the app: home → collection → product → the metafield sections → a product missing them
- [ ] Out of scope list, each item with its reason: cart, checkout, auth, orders, OAuth and server-side credential storage, error monitoring, analytics, automated tests, CI/CD, store deployment
- [ ] Nothing on that list is actually implemented in the repo
- [ ] No roadmap promises

### US-007: Demo run-through

As the author, I want the app demoable on demand so that showing it does not go sideways live.

**Depends on:** US-006
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] The README walkthrough of US-006 performed once end to end on the simulator already running
- [ ] A product with no metafields exists in the test data, so the absent case can be shown, not described
- [ ] Anything that breaks is fixed in the PRD that owns it, not patched here
- [ ] Lives in the README as "How to Use" — no separate script file

## Functional Requirements

- FR-1: README covers About, Technologies, Requirements, How to Run, Project Structure, Key Features, How to Use, Out of Scope, Contact
- FR-2: Setup instructions work from a clean clone
- FR-3: No claim in the README is unsupported by the code

## Non-Goals

No architecture diagrams beyond ASCII, no screenshot gallery, no produced video, no bilingual duplication of the whole document.

## Technical Considerations

- `README.md` currently holds the original requirements text the POC was built from; the project README replaces it. What happens to that text is the user's call — it is not removed without an explicit go-ahead.
- Everything needed already exists in `memory/decisions.md`. This block condenses ADRs into reader-facing prose.
- If writing a section reveals the code does not support it, the code is wrong — fix it in the owning PRD and come back.

## Success Metrics

- A developer clones, runs and navigates the app without asking a question
- The walkthrough runs clean on the first try

## Open Questions

- **README language** — **Assumption:** English, matching the code naming and the reference repo. Portuguese section added only if asked.
- **The requirements text now in `README.md`** — **Assumption:** none; waiting on the user to say whether it is kept somewhere or dropped.
