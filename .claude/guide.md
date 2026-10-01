# How to Use `.claude/` — Load Order + Anti-Bloat

## Load order

**Every prompt (auto-injected, ~15KB ceiling):**
- `CLAUDE.md` · `standards/quick-rules.md` · `memory/decisions-index.md`

**Code generation (`mode: code`):**
- Always-on + whatever the `ROUTING DIRECTIVE` lists
- `standards/security.md` mandatory for anything touching tokens, env, deep links, network
- `templates/*` when scaffolding

**Review (`mode: review`):**
- Everything from `code` + `memory/activity-log.md`; brain cross-check on

## Anti-bloat rules

- Never load brain proactively — `precedence.md` says when
- `memory/decisions.md` (full) loads only on `adr|decisão|por que decid|override|invariant` prompts
- `activity-log.md` is prunable
- Standards reference brain by path; never duplicate brain content
- Always-load over ~15KB → split the file into `*-full.md` + a one-line-per-item hot file

## Mode switch

```bash
sed -i '' 's/mode: code/mode: review/' .claude/config.yml
sed -i '' 's/brain_lookup: off/brain_lookup: on/' .claude/config.yml
```

## Harness maintenance

- `bash .claude/scripts/doctor.sh` — self-check (FAIL = broken promise)
- `bash .claude/scripts/check-security.sh` — secrets + deps + SAST
- `bash .claude/scripts/graph-sync.sh` — drain the graph queue and rebuild
