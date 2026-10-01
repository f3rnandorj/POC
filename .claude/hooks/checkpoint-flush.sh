#!/usr/bin/env bash
# Stop + PreCompact hook — rewrites session-state.md, appends to activity-log.md, clears the buffer.
# Idempotent: no-op when the buffer is empty AND the tree is clean.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

BUF=".claude/memory/.session-buffer.jsonl"
STATE=".claude/memory/session-state.md"
LOG=".claude/memory/activity-log.md"
mkdir -p .claude/memory

DIRTY=$(git status --porcelain 2>/dev/null | head -40)
[ -s "$BUF" ] || [ -n "$DIRTY" ] || exit 0

TS=$(date -u +"%Y-%m-%d %H:%M UTC")
BRANCH=$(git branch --show-current 2>/dev/null || echo "(no git repo)")
COMMIT=$(git log -1 --oneline 2>/dev/null || echo "(no commits)")

if [ -s "$BUF" ] && command -v jq >/dev/null 2>&1; then
  FILES=$(jq -r '.file' "$BUF" 2>/dev/null | sort -u | head -30)
else
  FILES=""
fi
QUEUED=$( [ -f .claude/memory/.graph-queue ] && sort -u .claude/memory/.graph-queue | wc -l | tr -d ' ' || echo 0 )

{
  echo "# Session State"
  echo ""
  echo "**Last checkpoint:** $TS"
  echo "**Branch:** $BRANCH"
  echo "**Last commit:** $COMMIT"
  echo "**Graph queue:** $QUEUED file(s) pending — drain with \`bash .claude/scripts/graph-sync.sh\`"
  echo ""
  echo "## Files touched this session"
  echo ""
  if [ -n "$FILES" ]; then echo "$FILES" | sed 's/^/- /'; else echo "- (none recorded)"; fi
  echo ""
  echo "## Uncommitted changes"
  echo ""
  if [ -n "$DIRTY" ]; then echo '```'; echo "$DIRTY"; echo '```'; else echo "(clean)"; fi
  echo ""
  echo "## How to resume"
  echo ""
  echo "1. Read \`.claude/standards/quick-rules.md\` and \`.claude/memory/decisions-index.md\`."
  echo "2. Review the uncommitted changes above."
  echo "3. Drain the graph queue if non-empty, then continue the next step."
} > "$STATE"

TODAY=$(date -u +%Y-%m-%d)
[ -f "$LOG" ] || printf '# Activity Log\n\nDated. Prunable.\n\n---\n\n' > "$LOG"
grep -q "^## $TODAY" "$LOG" || printf '\n## %s\n' "$TODAY" >> "$LOG"
COUNT=$( [ -s "$BUF" ] && wc -l < "$BUF" | tr -d ' ' || echo 0 )
echo "- Checkpoint $TS — $COUNT mutation(s), branch $BRANCH." >> "$LOG"

: > "$BUF"
exit 0
