#!/usr/bin/env bash
# PostToolUse Write|Edit hook — queues changed CODE files for the knowledge graph.
# Never rebuilds inline (a rebuild mid-session would stall the turn). Drain with:
#   bash .claude/scripts/graph-sync.sh
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -n "$FILE" ] || exit 0

# code files only — markdown/config churn must not mark the graph dirty
echo "$FILE" | grep -qE '\.(ts|tsx|js|jsx)$' || exit 0
echo "$FILE" | grep -qE '/(node_modules|graphify-out|ios/Pods|android/build)/' && exit 0

mkdir -p .claude/memory
echo "$FILE" >> .claude/memory/.graph-queue
exit 0
