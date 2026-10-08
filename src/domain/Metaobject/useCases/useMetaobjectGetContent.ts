import type { AreaBlocks } from "@config";
import { storyBlocksIn } from "@config";

import { toAreaContent } from "../../contentAreas";

import { useMetaobjectGetBlocks } from "./useMetaobjectGetBlocks";

/**
 * Areas whose blocks all come from metaobjects — the home screen's. A screen that also has blocks
 * from another source groups them itself, with `useMetaobjectGetBlocks` + `toAreaContent`.
 */
export function useMetaobjectGetContent<Area extends string>(
  areas: AreaBlocks<Area>[],
) {
  const { blocks, isLoading, error } = useMetaobjectGetBlocks(
    storyBlocksIn(areas),
  );

  return {
    content: toAreaContent(areas, blocks),
    isLoading,
    error,
  };
}
