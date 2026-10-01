#!/usr/bin/env bash
# UserPromptSubmit hook — classifies the prompt and emits a ROUTING DIRECTIVE on stdout.
# stdout IS injected into the model's context. Fail-open without jq.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || true

command -v jq >/dev/null 2>&1 || exit 0

PAYLOAD=$(cat)
PROMPT=$(echo "$PAYLOAD" | jq -r '.prompt // ""')
[ -n "$PROMPT" ] || exit 0
LP=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')

REQUIRED=()
add() { REQUIRED+=("$1"); }

# ── post-compact resume flag (one-shot) ──────────────────────────────────────
FLAG=".claude/memory/.post-compact-flag"
if [ -f "$FLAG" ]; then
  echo "POST-COMPACT RESUME DIRECTIVE"
  echo ""
  echo "Context was compacted. Read .claude/memory/session-state.md BEFORE answering this prompt."
  cat "$FLAG"
  echo ""
  rm -f "$FLAG"
fi

# ── small talk fast path ─────────────────────────────────────────────────────
SMALLTALK_RE='^[[:space:]]*(oi|ol[áa]|bom dia|boa tarde|boa noite|obrigad[oa]|valeu|thanks|thank you|tchau|bye|ok|beleza)[[:punct:][:space:]]*$'
echo "$LP" | grep -qE "$SMALLTALK_RE" && exit 0

# ── meta fast path: prompts ABOUT the harness itself ─────────────────────────
META_RE='analise.*contexto|context.*overhead|otimiz.*\.claude|review.*\.claude|audit.*\.claude|harness|hook.*\.sh|route-?prompt|pre-edit|bash-guard|doctor\.sh|prompt cache|token consumption|quick-rules'
if echo "$LP" | grep -qE "$META_RE"; then
  echo ".claude/ ROUTING DIRECTIVE (meta — harness itself)"
  echo ""
  echo "REQUIRED files (relative to project root):"
  echo "  - .claude/standards/quick-rules.md"
  echo "  - .claude/memory/decisions-index.md"
  echo "  - .claude/guide.md"
  echo ""
  echo "Do not load code-generation standards for a harness-meta prompt."
  exit 0
fi

# ── keyword routing ──────────────────────────────────────────────────────────
SHOPIFY_RE='shopify|storefront|graphql|metafield|metaobject|variant|collection|merchant|winter collection|care.?instruction|promotion.?text|badge|brand story'
ARCH_RE='arquitetura|architecture|layer|camada|folder structure|estrutura de pasta|domain|adapter|service layer|use.?case|data flow|barrel|path alias|where.*should.*live|onde.*fica'
FRONT_RE='screen|tela|component|componente|navigation|navega|react query|tanstack|restyle|flatlist|product card|product detail|product list|home|hook|useq|render'
DESIGN_RE='design|token|theme|tema|palette|paleta|typography|tipografia|spacing|radius|empty state|loading|skeleton|identity|identidade|cor|color|layout'
SEC_RE='token|secret|segredo|credential|credencial|\.env|deep link|webview|logging|log de|storage|keychain|mmkv|gitleaks|vulnerab'
NAMING_RE='naming|nomenclatura|barrel|alias|kebab|pascalcase|camelcase|nome do arquivo|file name'
STYLE_RE='code style|blank line|linha em branco|formatting|import order|ordem de import|file order|helper|refactor|extrair'
ISSUE_RE='issue|bug|ticket|crash|n[ãa]o funciona|not working|regress|root cause|quebrou|broken|erro '
SCAFFOLD_RE='criar|cria |novo |nova |new |scaffold|add |adicionar|implement|implementa|montar|setup'
STATE_RE='onde paramos|where.*we.*stop|wip|continuar|continue|retomar|resume'

echo "$LP" | grep -qE "$SHOPIFY_RE" && add ".claude/standards/shopify.md"
echo "$LP" | grep -qE "$ARCH_RE"    && add ".claude/standards/architecture.md"
echo "$LP" | grep -qE "$FRONT_RE"   && add ".claude/standards/frontend.md"
echo "$LP" | grep -qE "$DESIGN_RE"  && add ".claude/standards/design.md"
echo "$LP" | grep -qE "$SEC_RE"     && add ".claude/standards/security.md"
echo "$LP" | grep -qE "$NAMING_RE"  && add ".claude/standards/naming.md"
echo "$LP" | grep -qE "$STYLE_RE"   && add ".claude/standards/code-style.md"
echo "$LP" | grep -qE "$STATE_RE"   && add ".claude/memory/session-state.md"

if echo "$LP" | grep -qE "$ISSUE_RE"; then
  add ".claude/standards/issue-protocol.md"
  add ".claude/templates/issue.md"
fi

# full ADR text only for decision-archaeology prompts
echo "$LP" | grep -qE '\badr\b|decis[ãa]o|decision|por que decid|why.*decid|override|invariant|alternativa rejeitada' \
  && add ".claude/memory/decisions.md"
echo "$LP" | grep -qE 'archive|hist[óo]rico|legacy' && add ".claude/memory/decisions-archive.md"

# scaffold verbs pull the matching template
if echo "$LP" | grep -qE "$SCAFFOLD_RE"; then
  echo "$LP" | grep -qE 'metafield|badge|se[çc][ãa]o|section|winter|care|promotion|feature do cliente|pedido do cliente|merchant success' \
    && add ".claude/templates/metafield-feature.md"
  echo "$LP" | grep -qE 'domain|dom[íi]nio|service|adapter|api|query|collection|product' \
    && add ".claude/templates/shopify-domain.md"
fi

# ── emit ─────────────────────────────────────────────────────────────────────
echo ".claude/ ROUTING DIRECTIVE (auto-classified)"
echo ""
echo "Read each REQUIRED file below before generating any output that touches the project's standards or scaffolds code."
echo ""
echo "REQUIRED files (relative to project root):"
echo "  - .claude/standards/quick-rules.md"
echo "  - .claude/memory/decisions-index.md"
if [ ${#REQUIRED[@]} -gt 0 ]; then
  printf '%s\n' "${REQUIRED[@]}" | sort -u | sed 's/^/  - /'
fi
echo ""
echo "RULES:"
echo "1. Read every file in the list before code/design output."
echo "2. Do not preemptively load files outside the list — they were classified as not relevant."
echo "3. If a required file is insufficient and you must consult brain, follow .claude/precedence.md (say 'falling back to brain' first)."
echo "4. If a file in the list does not exist, skip it silently; do not invent paths."
echo "5. quick-rules.md is mandatory regardless."
echo "6. Architecture/impact/exploration questions start at graphify-out/ (see CLAUDE.md), not at Grep."
exit 0
