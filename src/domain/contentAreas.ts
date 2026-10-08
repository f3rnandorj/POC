import type { AreaBlocks } from "@config";

import type { AreaContent, ResolvedBlock } from "./contentTypes";

/** Walks the declarations, not the resolutions: the key path is the area, the index the order. */
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
