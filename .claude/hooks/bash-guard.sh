#!/usr/bin/env bash
# PreToolUse Bash hook — blocks destructive filesystem / git / device commands.
# Block = exit 2 + stderr. The AI must then ask the user for explicit confirmation.
# Mobile profile: no SQL / shadow-DB / docker blocks (no caller in an RN repo).
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0   # fail-open

PAYLOAD=$(cat)
[ "$(echo "$PAYLOAD" | jq -r '.tool_name // ""')" = "Bash" ] || exit 0
CMD=$(echo "$PAYLOAD" | jq -r '.tool_input.command // ""')
[ -n "$CMD" ] || exit 0

block() {
  echo "[bash-guard] BLOCKED: $1" >&2
  echo "[bash-guard] Command: $(echo "$CMD" | head -c 300)" >&2
  echo "[bash-guard] If intentional, ask the user for explicit confirmation and run it manually, or rephrase the command." >&2
  exit 2
}

# ── Device / simulator state (mobile profile) ───────────────────────────────
echo "$CMD" | grep -qE 'xcrun +simctl +(erase|delete)|adb +(uninstall|shell +pm +clear)|emulator +.*-wipe-data' \
  && block "device/simulator wipe — destroys persisted state used by UI validation."

# ── Filesystem ─────────────────────────────────────────────────────────────
if echo "$CMD" | grep -qE '\brm +(-[a-zA-Z]*[rf][a-zA-Z]* +)+'; then
  echo "$CMD" | grep -qE '\brm +(-[a-zA-Z]+ +)+("?/tmp/|[^ ]*node_modules|[^ ]*/dist|[^ ]*/build|[^ ]*coverage|[^ ]*\.cache|[^ ]*ios/Pods|[^ ]*\.gradle|[^ ]*DerivedData|[^ ]*metro-cache)' \
    || block "recursive/forced delete outside the allowlist (/tmp, node_modules, dist, build, coverage, .cache, ios/Pods, .gradle, DerivedData, metro-cache) — confirm the target with the user."
fi

# ── Git history / state ────────────────────────────────────────────────────
echo "$CMD" | grep -qE 'git +(reset +--hard|clean +-[a-zA-Z]*f|push +.*--force(\b|-with-lease)|branch +-D|checkout +-- )' \
  && block "destructive git (reset --hard / clean -f / force-push / branch -D / checkout --) — the deletion policy requires explicit approval."

exit 0
