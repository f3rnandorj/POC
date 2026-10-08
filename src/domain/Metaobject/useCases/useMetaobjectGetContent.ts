import type { AreaBlocks } from "@config";
import { storyBlocksIn } from "@config";

import { toAreaContent } from "../../contentAreas";

import { useMetaobjectGetBlocks } from "./useMetaobjectGetBlocks";

/** Metaobject-only areas. A screen mixing sources groups them itself with `toAreaContent`. */
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
