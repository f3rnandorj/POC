#!/usr/bin/env bash
# PreToolUse Write|Edit hook — blocks quick-rules violations.
# Block = exit 2 + reason on stderr. Fail-open without jq.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

CONTENT=""
if [ "$TOOL_NAME" = "Write" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [ "$TOOL_NAME" = "Edit" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  exit 0
fi
[ -n "$CONTENT" ] || exit 0

# only gate source files
echo "$FILE_PATH" | grep -qE '/src/.*\.(ts|tsx)$' || exit 0

VIOLATIONS=()

# ── Rule #2 / architecture boundary: UI never imports the Shopify client ─────
if echo "$FILE_PATH" | grep -qE '/src/(screens|components)/'; then
  echo "$CONTENT" | grep -qE "from +['\"]@api" \
    && VIOLATIONS+=("#2 boundary — screens/components must not import @api. Go through a useCase hook -> service -> adapter.")
  echo "$CONTENT" | grep -qE '\bedges\b|\.node\b|graphql' \
    && VIOLATIONS+=("#2 boundary — Storefront shape (edges/node/graphql) referenced in the UI layer. The adapter flattens it.")
fi

# ── Rule #3: no inline GraphQL outside *Queries.ts / fragments.ts ────────────
if ! echo "$FILE_PATH" | grep -qE '(Queries|fragments)\.ts$'; then
  echo "$CONTENT" | grep -qE '(query|mutation) +[A-Z][A-Za-z0-9]* *[({]' \
    && VIOLATIONS+=("#3 GraphQL document outside {domain}Queries.ts / fragments.ts.")
fi

# ── Rule #4 / security: no hardcoded Storefront token or store domain ───────
echo "$CONTENT" | grep -qiE 'shpat_|shpca_|shppa_|X-Shopify-Storefront-Access-Token" *: *"[A-Za-z0-9]' \
  && VIOLATIONS+=("#4 security — Shopify token literal in source. Read it from src/config/merchant (env-backed).")
if ! echo "$FILE_PATH" | grep -qE '/src/config/merchant/'; then
  echo "$CONTENT" | grep -qE "['\"][a-z0-9-]+\.myshopify\.com" \
    && VIOLATIONS+=("#4 security — store domain literal. It belongs in src/config/merchant/merchantConfig.ts.")
fi

# ── Rule #5: no visible placeholder for an absent metafield ─────────────────
echo "$CONTENT" | grep -qE '(badge|material|promotionText|promotion|careInstructions|metafields?\.[a-zA-Z]+) *(\?\?|\|\|) *['\''"]' \
  && VIOLATIONS+=("#5 absent metafield must render nothing — no fallback string. Return null in the component instead.")
echo "$CONTENT" | grep -qE 'String\((product\.)?metafields\.|String\((badge|material|promotionText)\)' \
  && VIOLATIONS+=("#5 stringifying a possibly-absent metafield renders 'undefined'. Guard with an early null return.")

# ── Rule #6: no merchant-named symbols outside config/merchant ──────────────
if ! echo "$FILE_PATH" | grep -qE '/src/config/merchant/'; then
  echo "$FILE_PATH$CONTENT" | grep -qiE 'northstar|acme|examplebrand' \
    && VIOLATIONS+=("#6 merchant name outside src/config/merchant/. Build it generically (<ProductBadge text=...>), flag it in merchantConfig.")
fi

# ── Rule #8/#9: Restyle only — no StyleSheet, no raw hex, no inline style ───
if echo "$FILE_PATH" | grep -qE '\.tsx$'; then
  echo "$CONTENT" | grep -qE 'StyleSheet\.create' \
    && VIOLATIONS+=("#8 StyleSheet.create — use Restyle props (Box/Text) from @theme.")
  if ! echo "$FILE_PATH" | grep -qE '/src/theme/'; then
    echo "$CONTENT" | grep -qE "(color|backgroundColor|borderColor) *[:=] *['\"]#[0-9a-fA-F]{3,8}" \
      && VIOLATIONS+=("#9 raw hex — use a theme token. A new token is an ADR, not an inline value.")
  fi
fi

# ── Rule #10: barrel imports only ───────────────────────────────────────────
echo "$CONTENT" | grep -qE "from +['\"]@(domain|components|screens|api|theme|config|infra|routes)/[A-Za-z0-9_-]+/" \
  && VIOLATIONS+=("#10 deep import past a barrel. Import from the alias root (e.g. '@domain').")

# ── Rule #11: no test files (no test layer installed) ───────────────────────
echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|tsx)$' \
  && VIOLATIONS+=("#11 no test layer installed in this repo. Say the infra must be set up first instead of emitting a test file.")

# ── Rule #16: no nested function declarations (.ts only) ────────────────────
if echo "$FILE_PATH" | grep -qE '\.ts$'; then
  NESTED=$(echo "$CONTENT" | awk '
    /^(export[[:space:]]+)?function[[:space:]]+[A-Za-z_]/ { depth++; next }
    depth > 0 && /^[[:space:]]+function[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*\(/ { found=1 }
    /^}[[:space:]]*$/ { if (depth > 0) depth-- }
    END { exit found ? 1 : 0 }
  ' && echo "" || echo "match")
  [ "$NESTED" = "match" ] \
    && VIOLATIONS+=("#16 nested function declaration in .ts — declare helpers at top level (below the main export) or extract to utils/.")
fi

# ── Rule #15: size soft-warn (does NOT block) ──────────────────────────────
if echo "$FILE_PATH" | grep -qE '\.tsx$'; then
  LINES=$(echo "$CONTENT" | wc -l | tr -d ' ')
  [ "$LINES" -gt 250 ] && echo "[pre-edit-validate] WARN — $FILE_PATH has $LINES lines (>250). Extract sub-components/helpers (#15)." >&2
fi

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo "[pre-edit-validate] BLOCKED — quick-rules violations in $FILE_PATH:" >&2
  for v in "${VIOLATIONS[@]}"; do echo "  - $v" >&2; done
  echo "" >&2
  echo "Fix and retry. Full rules: .claude/standards/quick-rules.md" >&2
  exit 2
fi
exit 0
