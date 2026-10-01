#!/usr/bin/env bash
# PreToolUse Bash hook — catches destructive filesystem / git / device commands.
# Match = permissionDecision "ask": the user gets the prompt and may authorize.
# Mobile profile: no SQL / shadow-DB / docker blocks (no caller in an RN repo).
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0   # fail-open

PAYLOAD=$(cat)
[ "$(echo "$PAYLOAD" | jq -r '.tool_name // ""')" = "Bash" ] || exit 0
CMD=$(echo "$PAYLOAD" | jq -r '.tool_input.command // ""')
[ -n "$CMD" ] || exit 0

ask_user() {
  # `ask` escalates to the user's permission prompt (exit 0 + JSON, per the hooks docs).
  # Never `exit 2`: that is an unconditional block with no path to approval — it fires
  # even when the user has already authorized the command in conversation.
  jq -nc --arg r "$1" --arg c "$(echo "$CMD" | head -c 300)" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask",
      permissionDecisionReason: ("[bash-guard] " + $r + "\n\nComando: " + $c)}}'
  exit 0
}

# ── Device / simulator state (mobile profile) ───────────────────────────────
echo "$CMD" | grep -qE 'xcrun +simctl +(erase|delete)|adb +(uninstall|shell +pm +clear)|emulator +.*-wipe-data' \
  && ask_user "device/simulator wipe — destroys persisted state used by UI validation."

# ── Filesystem ─────────────────────────────────────────────────────────────
if echo "$CMD" | grep -qE '\brm +(-[a-zA-Z]*[rf][a-zA-Z]* +)+'; then
  echo "$CMD" | grep -qE '\brm +(-[a-zA-Z]+ +)+("?/tmp/|[^ ]*node_modules|[^ ]*/dist|[^ ]*/build|[^ ]*coverage|[^ ]*\.cache|[^ ]*ios/Pods|[^ ]*\.gradle|[^ ]*DerivedData|[^ ]*metro-cache)' \
    || ask_user "recursive/forced delete outside the allowlist (/tmp, node_modules, dist, build, coverage, .cache, ios/Pods, .gradle, DerivedData, metro-cache) — confirm the target with the user."
fi

# ── Git history / state ────────────────────────────────────────────────────
echo "$CMD" | grep -qE 'git +(reset +--hard|clean +-[a-zA-Z]*f|push +.*--force(\b|-with-lease)|branch +-D|checkout +-- )' \
  && ask_user "destructive git (reset --hard / clean -f / force-push / branch -D / checkout --) — the deletion policy requires explicit approval."

exit 0
