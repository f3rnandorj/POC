#!/usr/bin/env bash
# PreCompact hook — writes a one-shot flag consumed by the next route-prompt.sh run.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

mkdir -p .claude/memory
{
  echo "compacted_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "branch: $(git branch --show-current 2>/dev/null || echo '(no git repo)')"
} > .claude/memory/.post-compact-flag
exit 0
