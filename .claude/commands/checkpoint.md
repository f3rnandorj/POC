---
description: Force a session checkpoint — flush the buffer to session-state.md + activity-log.md
---

# /checkpoint

Manual flush of the current session state. Run when stepping away, before a manual `/compact`, or after finishing a discrete piece of work.

## What it does

```bash
bash .claude/hooks/checkpoint-flush.sh
```

Reads `memory/.session-buffer.jsonl`, overwrites `memory/session-state.md` (branch, last commit, files touched, uncommitted changes, pending graph queue, resume steps), appends a dated line to `memory/activity-log.md`, clears the buffer.

Then summarize in 2-3 lines: branch + last commit, pending graph queue, next concrete step.

## When NOT to use

- During small talk / off-topic prompts
- Mid-tool-call — let the current operation finish
