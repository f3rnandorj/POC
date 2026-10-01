#!/usr/bin/env bash
# graph-sync.sh — drains the graph queue and rebuilds the knowledge graph.
# AST-only, no API cost. Self-healing: builds from scratch when graphify-out/ is absent.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

QUEUE=".claude/memory/.graph-queue"
LOG=".claude/memory/.graph-sync.log"
FORCE="${1:-}"

command -v graphify >/dev/null 2>&1 || {
  echo "✗ graphify not on PATH (expected ~/.local/bin/graphify). Install it or drop the graph rule from CLAUDE.md."
  exit 1
}

[ -d src ] || { echo "· no src/ yet — nothing to graph. Run again after the app is scaffolded."; exit 0; }

PENDING=0
[ -f "$QUEUE" ] && PENDING=$(sort -u "$QUEUE" | wc -l | tr -d ' ')

if [ "$PENDING" -eq 0 ] && [ -f graphify-out/graph.json ] && [ "$FORCE" != "--force" ]; then
  echo "· queue empty and graph present — nothing to do (use --force to rebuild anyway)."
  exit 0
fi

if [ -f graphify-out/graph.json ]; then
  echo "── updating graph ($PENDING file(s) queued)"
  graphify update . 2>&1 | tee "$LOG" | tail -5
else
  echo "── graph missing — building from scratch"
  graphify . 2>&1 | tee "$LOG" | tail -5
fi

# graphify's HTML viz has a hard 5k-node ceiling and raises AFTER graph.json and
# GRAPH_REPORT.md are written. A "Rebuild failed" about the visual artifact is not
# a data failure — query/path/explain keep working.
if [ -f graphify-out/graph.json ]; then
  : > "$QUEUE"
  echo "✓ graph current — queue cleared (graphify-out/graph.json, GRAPH_REPORT.md)"
  exit 0
fi

echo "✗ graph.json still missing after the run — see $LOG"
exit 1
