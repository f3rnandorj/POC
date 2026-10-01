---
description: Drain the graph queue and rebuild the knowledge graph (AST-only, no API cost)
---

# /graph-sync

```bash
bash .claude/scripts/graph-sync.sh
```

Rebuilds `graphify-out/` from the files queued by `hooks/graph-queue.sh`. Builds from scratch when the graph is absent (the self-healing half of the graph rule in `CLAUDE.md`). `--force` rebuilds even with an empty queue.

Report: queued count, whether it updated or built from scratch, and any staleness the doctor still flags.
