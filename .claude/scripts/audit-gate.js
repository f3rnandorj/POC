#!/usr/bin/env node
// Lê NDJSON de `yarn audit --json` no stdin e decide se o gate bloqueia.
//
// Política: high/critical COM patch disponível bloqueia. Sem patch upstream
// (`patched_versions: "<0.0.0"`) é reportado e deixa passar — travar o push num
// advisory que ninguém pode consertar é o que faz as pessoas adotarem
// `--no-verify`, e aí o gate inteiro deixa de existir. Auto-cicatriza: no dia em
// que o upstream publicar o patch, o advisory muda de lista e volta a bloquear.
//
// Self-check: `node .claude/scripts/audit-gate.js --self-check`

const SEVERE = new Set(["high", "critical"]);

function classify(lines) {
  const block = new Map(), warn = new Map();
  for (const line of lines) {
    let d;
    try { d = JSON.parse(line); } catch { continue; }
    if (d.type !== "auditAdvisory") continue;
    const a = d.data.advisory;
    if (!SEVERE.has(a.severity)) continue;
    const target = a.patched_versions === "<0.0.0" ? warn : block;
    if (!target.has(a.id)) {
      target.set(a.id, `${a.severity} ${a.module_name} #${a.id} via ${d.data.resolution.path}`);
    }
  }
  return { block, warn };
}

function advisory(id, severity, patched) {
  return JSON.stringify({
    type: "auditAdvisory",
    data: {
      advisory: { id, severity, module_name: "pkg" + id, patched_versions: patched },
      resolution: { path: "a>b>pkg" + id },
    },
  });
}

if (process.argv.includes("--self-check")) {
  const assert = require("assert");
  const r = classify([
    advisory(1, "high", "<0.0.0"), // sem patch → warn
    advisory(2, "high", ">=2.1.0"), // com patch → block
    advisory(3, "critical", "<0.0.0"), // sem patch → warn
    advisory(4, "moderate", ">=1.0.0"), // abaixo do limiar → ignorado
    advisory(1, "high", "<0.0.0"), // duplicado por outro path → dedup
    "não é json",
    "",
  ]);
  assert.deepStrictEqual([...r.warn.keys()], [1, 3], "sem patch deve virar warn, deduplicado");
  assert.deepStrictEqual([...r.block.keys()], [2], "com patch deve bloquear");
  // um advisory sem patch sozinho nunca pode bloquear o push
  assert.strictEqual(classify([advisory(9, "critical", "<0.0.0")]).block.size, 0);
  console.log("✓ audit-gate self-check ok");
  process.exit(0);
}

const { block, warn } = classify(require("fs").readFileSync(0, "utf8").split("\n"));

if (warn.size) {
  console.log(`⚠ ${warn.size} advisory high/critical sem patch upstream — reportado, não bloqueia:`);
  for (const v of warn.values()) console.log("   " + v);
}
if (block.size) {
  console.log(`✗ ${block.size} advisory high/critical com patch disponível e não aplicado:`);
  for (const v of block.values()) console.log("   " + v);
  process.exit(1);
}
console.log("✓ nenhum high/critical corrigível pendente");
