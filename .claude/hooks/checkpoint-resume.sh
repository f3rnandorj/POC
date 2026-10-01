#!/usr/bin/env bash
# SessionStart hook — emits a resume directive on stdout when a prior checkpoint exists.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

STATE=".claude/memory/session-state.md"
[ -f "$STATE" ] || exit 0
grep -q '^\*\*Last checkpoint:\*\*' "$STATE" || exit 0

echo "RESUME DIRECTIVE — a prior session checkpoint exists."
echo ""
grep -E '^\*\*(Last checkpoint|Branch|Last commit|Graph queue):\*\*' "$STATE"
echo ""
echo "Read .claude/memory/session-state.md before starting work."
exit 0
