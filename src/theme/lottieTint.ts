import { toChannels } from "./contrast";

/**
 * The asset ships filled black, invisible on the base background, and the accent is only known
 * at runtime. Rewritten rather than tinted with `colorFilters`, which matches layers by the
 * keypath the designer exported — here, Cyrillic names from the original After Effects file.
 */
export function tintLottie<T>(source: T, hex: string): T {
  const [red, green, blue] = toChannels(hex);

  return retint(source, [red, green, blue, 1]) as T;
}

/** Lottie stores a fill as `{ ty: "fl", c: { k: [r, g, b, a] } }`, channels normalized to 0–1. */
function retint(node: unknown, color: number[]): unknown {
  if (Array.isArray(node)) {
    return node.map(item => retint(item, color));
  }

  if (node === null || typeof node !== "object") {
    return node;
  }

  const source = node as Record<string, unknown>;
  const tinted: Record<string, unknown> = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, retint(value, color)]),
  );

  // ponytail: fills only — the loader has no strokes. A stroked asset needs `"st"` here too.
  if (source.ty === "fl") {
    tinted.c = { ...(source.c as object), k: color };
  }

  return tinted;
}
