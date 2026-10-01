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
```

005, 006, 007 and 008 depend only on 004 and can be reordered. 009 seeds the store so the app looks filled — content only, no source change. 010 is last by definition: a general project README for a developer visiting the repo.

## Active PRDs

| # | Feature | File | Depends on | Source | Status |
|---|---|---|---|---|---|
| 009 | Catalog Seed | `active/009-catalog-seed.md` | 004, 007 | demo requirement — app must not look empty | draft |
| 010 | Project README and Demo | `active/010-project-readme.md` | 005-009 | general project doc | draft |

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

## How to author a new PRD

1. Copy `template.md` to `active/<nnn>-<slug>.md`
2. Fill `Standards Referenced` — it is authoritative and reloads those files when the PRD is reopened
3. Score every US 1-10; a US at 8 or above is split before the PRD activates
4. `Depends on` references US ids in the same PRD only; cross-PRD dependencies go in `Technical Considerations`
5. Add the row to the table above
