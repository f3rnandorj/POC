import { useQuery } from '@tanstack/react-query';

import { merchantConfig } from '@config';
import { QueryKeys } from '@infra';

import { brandStoryService } from '../brandStoryService';

/**
 * Both gates live here: a merchant without the capability and a merchant without the
 * metaobject type configured never issue the request at all.
 */
export function useBrandStoryGetDetail() {
  const type = merchantConfig.features.brandStory
    ? merchantConfig.metaobjects.brandStory
    : undefined;

  // React Query v5 rejects `undefined` as cached data, and "this store has no brand story" is
  // a legitimate answer — `null` crosses the cache, the UI gets `undefined` back.
  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKeys.BrandStory, type],
    queryFn: async () => (await brandStoryService.byType(String(type))) ?? null,
    enabled: Boolean(type),
  });

  return {
    brandStory: data ?? undefined,
    isLoading,
    error,
  };
}
