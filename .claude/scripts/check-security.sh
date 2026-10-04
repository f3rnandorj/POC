#!/usr/bin/env bash
# check-security.sh — secrets + vulnerable deps + SAST. Deterministic.
# A missing scanner FAILS the run: a gate that executed nothing is not a clean gate.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
fails=0; skipped=""

run_or_skip() { # $1 tool, $2 install hint, $3... command
  local tool="$1" hint="$2"; shift 2
  if command -v "$tool" >/dev/null 2>&1; then
    echo "── $tool"
    "$@" || fails=$((fails+1))
  else
    skipped="$skipped $tool"; echo "── $tool SKIPPED (install: $hint)"
  fi
}

# 1 — secrets (tree + history). The Storefront token is the one real secret here.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  run_or_skip gitleaks "brew install gitleaks" gitleaks detect --redact --no-banner
else
  run_or_skip gitleaks "brew install gitleaks" gitleaks detect --no-git --redact --no-banner
fi

# 2 — vulnerable deps
if [ -f package.json ]; then
  if [ -f yarn.lock ]; then
    # yarn 1: o exit code é um BITMASK de toda severidade encontrada (8=high, 16=critical)
    # e `--level` só filtra a saída, então não dá pra gatear pelo código de saída sem
    # bloquear em advisory que não tem patch. `audit-gate.js` decide pelo campo
    # `patched_versions`: com patch bloqueia, sem patch reporta. Ver o cabeçalho dele.
    run_or_skip yarn "corepack enable" bash -c 'if yarn --version | grep -q "^1\."; then yarn audit --json 2>/dev/null | node .claude/scripts/audit-gate.js; else yarn npm audit --severity high; fi'
  else
    run_or_skip npm "install node" npm audit --audit-level=high
  fi
else
  echo "── deps SKIPPED (no package.json yet — the RN app has not been scaffolded)"
fi

# 3 — SAST
run_or_skip semgrep "brew install semgrep" semgrep scan --config auto --error --severity ERROR --quiet

echo "---"
[ -n "$skipped" ] && { echo "✗ not run (tool missing):$skipped — gate invalid, install and re-run"; exit 1; }
[ "$fails" -eq 0 ] && { echo "✓ security scan clean"; exit 0; } || { echo "✗ $fails check(s) failed — findings above"; exit 1; }
