import type { AreaBlocks } from "@config";

import type { AreaContent, ResolvedBlock } from "./contentTypes";

/**
 * Groups resolved blocks into the areas that declared them, walking the declarations rather than
 * the resolutions: the key path decides the area and the array index decides the order. Blocks
 * resolved from different sources — product metafields, the store's metaobjects — are grouped in
 * one pass, which is what lets a screen hold one content map instead of one per source. An area
 * that collected nothing is left out of the result entirely.
 */
export function toAreaContent<Area extends string>(
  areas: AreaBlocks<Area>[],
  resolved: ResolvedBlock[],
): AreaContent<Area> {
  const byBlockId = groupByBlockId(resolved);
  const content: AreaContent<Area> = {};

  for (const [area, blocks] of areas) {
    const inArea = blocks.flatMap(block => byBlockId.get(block.id) ?? []);

    if (inArea.length > 0) {
      content[area] = inArea;
    }
  }

  return content;
}

/** A list per id, not one block: a story block resolves to one section per metaobject entry. */
function groupByBlockId(
  resolved: ResolvedBlock[],
): Map<string, ResolvedBlock[]> {
  const byBlockId = new Map<string, ResolvedBlock[]>();

  for (const block of resolved) {
    const group = byBlockId.get(block.id);

    if (group) {
      group.push(block);
    } else {
      byBlockId.set(block.id, [block]);
    }
  }

  return byBlockId;
}
