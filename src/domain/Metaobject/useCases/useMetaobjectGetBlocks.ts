import { useQueries } from "@tanstack/react-query";

import type { StoryBlock } from "@config";
import { getActiveMerchantId } from "@config";
import { QueryKeys } from "@infra";

import type { ResolvedStory } from "../../contentTypes";
import { metaobjectService } from "../metaobjectService";

/** One query per declared block, so an empty list issues no request at all. */
export function useMetaobjectGetBlocks(blocks: StoryBlock[]) {
  return useQueries({
    queries: blocks.map(block => ({
      // The merchant, because a `ref` is only unique inside one config.
      queryKey: [QueryKeys.Metaobject, getActiveMerchantId(), block],
      queryFn: () => metaobjectService.storiesByBlock(block),
    })),
    combine,
  });
}

function combine(results: MetaobjectQueryResult[]) {
  return {
    blocks: results.flatMap(result => result.data ?? []),
    isLoading: results.some(result => result.isLoading),
    error: results.find(result => result.error)?.error ?? undefined,
  };
}

interface MetaobjectQueryResult {
  data?: ResolvedStory[];
  isLoading: boolean;
  error: unknown;
}
