import { useQueries } from "@tanstack/react-query";

import type { StoryBlock } from "@config";
import { getActiveMerchantId } from "@config";
import { QueryKeys } from "@infra";

import type { ResolvedStory } from "../../contentTypes";
import { metaobjectService } from "../metaobjectService";

/**
 * One query per declared block, so each metaobject type is fetched once and cached on its own: an
 * empty list issues nothing, which is how a merchant that declared no story pays for none.
 *
 * Flat on purpose — the caller groups these into areas with `toAreaContent`, together with the
 * blocks it resolved from other sources, so one screen ends up with one content map.
 */
export function useMetaobjectGetBlocks(blocks: StoryBlock[]) {
  return useQueries({
    queries: blocks.map(block => ({
      // The merchant, because a `ref` is only unique inside one config and two stores may both
      // call theirs `brandStory`; then the whole block, which is what the query reads.
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
