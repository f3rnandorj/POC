# FUEGO POC (Northstar) — Project Instructions

`.claude/` is the single source of truth. Routing is mechanical via `.claude/hooks/route-prompt.sh` — every prompt gets a `ROUTING DIRECTIVE` listing the files to load. Do **not** preemptively read files outside that directive.

**Declared facts** (never re-detect, never re-ask): profile `mobile` (React Native CLI) · dev mode `ai-assisted` · team `solo` · architecture `domain-driven + service layer (API-Bound)` · infra pattern `API-Bound` · no test layer installed.

## Always loaded (cheap, auto-injected)

- `.claude/standards/quick-rules.md` — non-negotiables (includes brain fallback summary)
- `.claude/memory/decisions-index.md` — one line per ADR (full text in `decisions.md`, older in `decisions-archive.md`)

Everything else is keyword-routed by the hook. Manual routing reference: `.claude/standards/_index.md`.

## Knowledge graph

This project has a knowledge graph. Consult it BEFORE navigating files: architecture, impact and exploration questions start at the graph (`graphify-out/GRAPH_REPORT.md`, `graphify-out/wiki/index.md`, or the `code-review-graph` MCP tools), falling back to Grep/Glob/Read only for what the graph doesn't cover. If the declared graph output is missing or stale, CREATE/REBUILD it first (`graphify .` / `graphify update .`), then proceed — never skip the rule because the graph is absent.

After modifying code files, run `graphify update .` (AST-only, no API cost). `graph-queue.sh` buffers changed files automatically; `bash .claude/scripts/graph-sync.sh` drains the queue and rebuilds.

## Mechanical gates (hooks — wired in `.claude/settings.json`)

| Hook | Event | Purpose |
|---|---|---|
| `route-prompt.sh` | `UserPromptSubmit` | Emits `ROUTING DIRECTIVE`. Meta/small-talk fast paths. Post-compact flag consumer. |
| `pre-edit-validate.sh` | `PreToolUse` (Write/Edit) | Blocks quick-rule violations. |
| `bash-guard.sh` | `PreToolUse` (Bash) | Blocks destructive filesystem / git / device-wipe commands. |
| `checkpoint-record.sh` + `graph-queue.sh` | `PostToolUse` (Write/Edit) | Buffers file mutations; queues code files for the graph. |
| `checkpoint-flush.sh` | `Stop` + `PreCompact` | Rewrites session-state.md + activity-log.md. |
| `checkpoint-resume.sh` | `SessionStart` | Injects resume directive if a prior checkpoint exists. |
| `post-compact-prime.sh` | `PreCompact` | Writes resume flag for the next UserPromptSubmit. |

Requires `jq`; hooks fail-open if missing. Manual flush: `/checkpoint`. Harness self-check: `bash .claude/scripts/doctor.sh`.

## Update rules

- Architectural decision → append to `memory/decisions.md` + a row in `decisions-index.md` (same edit)
- Brain rule applied via fallback → propose adding it to `standards/`, never silent write
- New merchant metafield/feature → follow `templates/metafield-feature.md`; never create a merchant-named component

## Never

- Read `~/.claude/brain/` proactively
- Duplicate brain content into `.claude/` — reference by path
- Preemptively read files outside the current `ROUTING DIRECTIVE`
- Name a component after a merchant (`NorthstarWinterBadge`) — see `standards/shopify.md`
