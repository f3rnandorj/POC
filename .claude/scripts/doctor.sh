#!/usr/bin/env bash
# doctor.sh — harness self-check. FAIL = broken promise (exit 1); WARN = advisory.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
C=".claude"; fails=0; warns=0
fail() { echo "✗ FAIL: $1"; fails=$((fails+1)); }
warn() { echo "⚠ WARN: $1"; warns=$((warns+1)); }
ok()   { echo "✓ $1"; }

[ -d "$C" ] || { echo "✗ no $C/ here — run the bootstrap interview instead"; exit 1; }

# 1 — jq (every hook fail-opens without it = ALL enforcement silently off)
command -v jq >/dev/null && ok "jq present" \
  || fail "jq missing — hooks fail-open without it (brew install jq)"

# 2 — hooks registered in settings.json exist on disk and are executable
if [ -f "$C/settings.json" ] && command -v jq >/dev/null; then
  while IFS= read -r h; do
    hp="${h/\$CLAUDE_PROJECT_DIR/.}"
    [ -f "$hp" ] || { fail "registered hook missing on disk: $h"; continue; }
    [ -x "$hp" ] || fail "hook not executable: $hp (chmod +x)"
  done < <(jq -r '.. | .command? // empty' "$C/settings.json" | grep -oE '[^ ]*hooks/[^ "]+\.sh' | sort -u)
  ok "settings.json hook wiring checked"
else
  warn "settings.json missing or unreadable — hooks are DORMANT until the user authorizes it"
fi

# 3 — hooks on disk never registered (orphans)
for f in "$C"/hooks/*.sh; do
  [ -e "$f" ] || continue
  grep -q "$(basename "$f")" "$C/settings.json" 2>/dev/null || warn "hook on disk but not registered: $f"
done

# 4 — per-dev state must not be tracked (merge-conflict machine)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  for f in memory/session-state.md memory/activity-log.md; do
    git ls-files --error-unmatch "$C/$f" >/dev/null 2>&1 && \
      fail "per-dev state is tracked: $C/$f (apply the gitignore split, git rm --cached)"
  done
  ok "gitignore split checked"
else
  warn "not a git repo yet — gitignore split unverifiable (the RN scaffold will create it)"
fi

# 5 — always-load ceiling (~15KB): CLAUDE.md + hot files
total=0
for f in CLAUDE.md "$C"/standards/quick-rules.md "$C"/memory/decisions-index.md; do
  [ -f "$f" ] && total=$((total + $(wc -c < "$f")))
done
[ "$total" -gt 15360 ] && warn "always-load = $((total/1024))KB > 15KB ceiling — split hot/full" \
  || ok "always-load $((total/1024))KB within ceiling"

# 6 — decisions-index rows must resolve in decisions.md (index/archive drift)
if [ -f "$C/memory/decisions-index.md" ] && [ -f "$C/memory/decisions.md" ]; then
  while IFS= read -r d; do
    grep -q "^## $d" "$C/memory/decisions.md" || \
      warn "decisions-index row dated $d has no matching ADR in decisions.md (promote or drop it)"
  done < <(grep -oE '^\| [0-9]{4}-[0-9]{2}-[0-9]{2}' "$C/memory/decisions-index.md" | tr -d '| ' | sort -u)
  ok "ADR index ↔ decisions.md checked"
fi

# 7 — duplicate rule ids in quick-rules
if [ -f "$C/standards/quick-rules.md" ]; then
  dups="$(grep -oE '^[0-9]+\.' "$C/standards/quick-rules.md" | sort | uniq -d | tr '\n' ' ')"
  [ -n "$dups" ] && fail "duplicate rule numbers in quick-rules: $dups" || ok "rule ids unique"
fi

# 8 — standards referenced by the router must exist
if [ -f "$C/hooks/route-prompt.sh" ]; then
  while IFS= read -r p; do
    [ -f "$p" ] || fail "route-prompt.sh routes to a missing file: $p"
  done < <(grep -oE '\.claude/(standards|templates|memory)/[A-Za-z0-9._-]+\.md' "$C/hooks/route-prompt.sh" | sort -u)
  ok "router targets checked"
fi

# 9 — graph declared ↔ present (+ staleness) ↔ queue drained
if grep -qs 'This project has a knowledge graph' CLAUDE.md; then
  if [ -f graphify-out/graph.json ]; then
    new_src=$(find src \( -name '*.ts' -o -name '*.tsx' \) -newer graphify-out/graph.json 2>/dev/null | head -1)
    [ -n "$new_src" ] && warn "graph stale (src newer than graph.json) — run: bash $C/scripts/graph-sync.sh"
  elif [ -d src ]; then
    fail "CLAUDE.md declares a knowledge graph but graphify-out/graph.json is missing — run: graphify ."
  else
    warn "graph declared but there is no src/ yet — build it after the RN app is scaffolded (graphify .)"
  fi
  q=$( [ -f "$C/memory/.graph-queue" ] && sort -u "$C/memory/.graph-queue" | wc -l | tr -d ' ' || echo 0 )
  [ "$q" -gt 0 ] && warn "$q file(s) queued for the graph — drain with: bash $C/scripts/graph-sync.sh"
fi

# 10 — scripts executable
for f in "$C"/scripts/*.sh; do
  [ -e "$f" ] || continue
  [ -x "$f" ] || warn "script not executable: $f"
done

# 11 — no coverage gate installed, and that is deliberate (quick-rule #11)
if [ -f "$C/scripts/check-coverage-map.sh" ] && ! grep -qs 'test' package.json 2>/dev/null; then
  warn "check-coverage-map.sh exists but no test runner is installed — a gate matching nothing looks like coverage"
fi

echo "---"
echo "doctor: $fails fail(s), $warns warn(s)"
[ "$fails" -eq 0 ] && exit 0 || exit 1
