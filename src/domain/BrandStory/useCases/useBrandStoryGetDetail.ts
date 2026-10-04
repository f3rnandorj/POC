import { useQuery } from "@tanstack/react-query";

import { homeFooterStory } from "@config";
import { QueryKeys } from "@infra";

import { brandStoryService } from "../brandStoryService";

/** A merchant without a story block never issues the request. */
export function useBrandStoryGetDetail() {
  const story = homeFooterStory();

  // React Query v5 rejects `undefined` as cached data, so "no story" crosses the cache as `null`.
  const { data, isLoading, error } = useQuery({
    // The whole block, not its id: it is what the query reads, and it changes with the merchant.
    queryKey: [QueryKeys.BrandStory, story],
    queryFn: async () =>
      (story ? await brandStoryService.byBlock(story) : null) ?? null,
    enabled: Boolean(story),
  });

  return {
    brandStory: data ?? undefined,
    isLoading,
    error,
  };
}
