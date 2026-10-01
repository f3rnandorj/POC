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
004 product-metafields          │   ← EMV complete (README's "entrega mínima viável")
      ├──→ 005 winter-collection-badge
      ├──→ 006 product-care-section
      ├──→ 007 home-and-collections   (Case 1 in full; not on the EMV path)
      └──→ 008 multi-merchant-config  (Case 4 + Bônus 2)
                    ↓
            009 delivery-readme       (needs every other block shipped)
```

005, 006, 007 and 008 depend only on 004 and can be reordered. 009 is last by definition — it documents what shipped.

## Active PRDs

| # | Feature | File | Depends on | README source | Status |
|---|---|---|---|---|---|
| 001 | App Foundation | `active/001-app-foundation.md` | — | Entrega / architecture | draft |
| 002 | Shopify Product Data | `active/002-shopify-product-data.md` | 001 | CASE 1 — requisito técnico | draft |
| 003 | Product Browse | `active/003-product-browse.md` | 002 | CASE 1 — Product Detail | draft |
| 004 | Product Metafields | `active/004-product-metafields.md` | 003 | CASE 2 | draft |
| 005 | Winter Collection Badge | `active/005-winter-collection-badge.md` | 004 | CASE 3 + Requisito 4 | draft |
| 006 | Product Care Section | `active/006-product-care-section.md` | 004 | CASE 5 | draft |
| 007 | Home and Collections | `active/007-home-and-collections.md` | 004 | CASE 1 — navigation tree | draft |
| 008 | Multi-Merchant Config | `active/008-multi-merchant-config.md` | 004 | CASE 4 + Bônus 2 | draft |
| 009 | Delivery — README and Demo | `active/009-delivery-readme.md` | 005-008 | O que documentar | draft |

## Done PRDs

| Feature | Shipped | Outcome |
|---|---|---|
| (none) | | |

## How to author a new PRD

1. Copy `template.md` to `active/<nnn>-<slug>.md`
2. Fill `Standards Referenced` — it is authoritative and reloads those files when the PRD is reopened
3. Score every US 1-10; a US at 8 or above is split before the PRD activates
4. `Depends on` references US ids in the same PRD only; cross-PRD dependencies go in `Technical Considerations`
5. Add the row to the table above
