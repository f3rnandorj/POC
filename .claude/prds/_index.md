# PRD Index

This project runs in **`ai-assisted`** mode: the PRD pipeline agents (executor, linter, guardian) are **not installed** — see the ADR dated 2026-09-30 in `../memory/decisions.md`. The PRDs below are specs executed by hand, one block at a time; no hook auto-advances them.

If the full flow is adopted later, install `agents/prd-{executor,linter,guardian}.md` from the brain module `personal/tools/ia/harness/prd-spec.md` in the same session.

## Lifecycle

```
draft → active/ → done/  (archived; never auto-loaded)
```

A PRD is done when every AC is `[x]` and its Quality Gates passed on a simulator. On moving it to `done/`, convert its `Resolved Decisions` block into ADR entries in `../memory/decisions.md`.

## Execution order

Dependency-aware: the next block is the first whose dependencies are complete. **001 → 002 → 003 → 004** is the EMV — stop there if time runs short and the POC still demonstrates the full journey.

```
001 app-foundation
      ↓
002 shopify-product-data
      ↓
003 product-browse ─────────────┐
      ↓                         │
004 product-metafields          │   ← EMV complete (minimum viable journey)
      ├──→ 005 winter-collection-badge
      ├──→ 006 product-care-section
      ├──→ 007 home-and-collections   (full navigation tree; not on the EMV path)
      ├──→ 008 multi-merchant-config  (one codebase, many merchants)
      └──→ 009 catalog-seed           (content, not code; needs 007 for collection covers)
                    ↓
            010 project README        (needs every other block shipped)
                    ↓
            012 merchant content blocks   (supersedes 008's variation model)
```

005, 006, 007 and 008 depend only on 004 and can be reordered. 009 seeds the store so the app looks filled — content only, no source change. 010 is last by definition: a general project README for a developer visiting the repo.

013 follows 012: the block model made a merchant's **content** their own, and this one does the same for their **palette** — the two axes of "one app, many merchants". It supersedes the "one accent" half of the 2026-09-30 identity ADR.

012 reopens 008's subject after the fact: it needs 008 and 011 shipped, because it generalizes the metafield map **and** the metaobject map at once. It is a refactor with a negative diff, not a feature — it adds nothing to the demo journey, it removes the deploy from merchant onboarding.

## Active PRDs

| # | Feature | File | Depends on | Source | Status |
|---|---|---|---|---|---|
| — | _nenhuma PRD ativa_ | — | — | — | — |

## Done PRDs

| Feature | Shipped | Outcome |
|---|---|---|
| 001 App Foundation | 2026-10-01 | `done/001-app-foundation.md` |
| 002 Shopify Product Data | 2026-10-01 | `done/002-shopify-product-data.md` |
| 003 Product Browse | 2026-10-01 | `done/003-product-browse.md` |
| 004 Product Metafields | 2026-10-01 | `done/004-product-metafields.md` — EMV complete |
| 005 Winter Collection Badge | 2026-10-01 | `done/005-winter-collection-badge.md` |
| 006 Product Care Section | 2026-10-01 | `done/006-product-care-section.md` |
| 007 Home and Collections | 2026-10-01 | `done/007-home-and-collections.md` — CASE 1 complete |
| 008 Multi-Merchant Config | 2026-10-01 | `done/008-multi-merchant-config.md` |
| 011 Brand Story Metaobject | 2026-10-01 | `done/011-brand-story.md` — optional bonus |
| 009 Catalog Seed | 2026-10-01 | `done/009-catalog-seed.md` |
| 010 Project README and Demo | 2026-10-02 | `done/010-project-readme.md` — validated on a clean clone |
| 012 Merchant Content Blocks | 2026-10-02 | `done/012-merchant-content-blocks.md` — supersedes 008; unblocked the iOS 27 scene crash |
| 013 Merchant Brand Palette | 2026-10-03 | `done/013-merchant-brand-palette.md` — state colors became derived, not overridable |
| 014 Merchant Layout | 2026-10-03 | `done/014-merchant-layout.md` — arrangement per merchant; gallery uses images fetched since 002 |

## How to author a new PRD

1. Copy `template.md` to `active/<nnn>-<slug>.md`
2. Fill `Standards Referenced` — it is authoritative and reloads those files when the PRD is reopened
3. Score every US 1-10; a US at 8 or above is split before the PRD activates
4. `Depends on` references US ids in the same PRD only; cross-PRD dependencies go in `Technical Considerations`
5. Add the row to the table above
