#!/usr/bin/env bash
# PostToolUse Write|Edit hook — appends one JSONL line per mutation. Cheap, local-only.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -n "$FILE" ] || exit 0

mkdir -p .claude/memory
jq -nc --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg tool "$TOOL" --arg file "$FILE" \
  '{ts:$ts, tool:$tool, file:$file}' >> .claude/memory/.session-buffer.jsonl
exit 0
