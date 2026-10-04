import { toChannels } from "./contrast";

/**
 * Paints every fill in a Lottie document with one color.
 *
 * The asset ships filled black, which disappears on the near-black base background, and the
 * merchant's accent is only known at runtime. Rewriting the document is preferred over the
 * native `colorFilters` prop because that one matches layers by the keypath the designer
 * happened to export — here, Cyrillic names from the original After Effects file.
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
