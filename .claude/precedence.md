# Source-of-Truth Precedence

`.claude/` is authoritative. Brain (`~/.claude/brain/`) is a **reference library** consulted only on demand.

## When to consult brain

1. **User explicit request** ("consulta brain", naming a brain file)
2. **Bootstrap/upgrade of `.claude/`** — entry point `personal/tools/ia/harness/`
3. **Local silent** — `.claude/` covers no relevant standard. Declare: "Topic not covered in `.claude/`. Falling back to brain." before reading
4. **Local contradiction** — two local files disagree; brain breaks the tie, then fix the conflicting local file

## Conflict rule

**Local always wins. More specific always wins.**

1. `.claude/prds/active/<feature>.md`
2. `.claude/standards/*`
3. `.claude/memory/decisions.md`
4. `~/.claude/brain/developer/**`
5. `~/.claude/brain/personal/**`

## After brain fallback

1. Apply the rule
2. Propose adding it to `.claude/standards/*.md`
3. Wait for user approval before persisting

## Config flag

| `brain_lookup` | Behavior | Default mode |
|---|---|---|
| `off` | Never read brain unless invoked | `code` |
| `fallback` | Read brain only when local silent | `prd` |
| `on` | Cross-check both | `review` |
