import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@infra';

import { collectionService } from '../collectionService';

/**
 * `handle` is optional because the list screen serves both modes with one hook pair: no
 * handle means the caller wants every product, and this query simply never runs.
 */
export function useCollectionGetProducts(handle?: string) {
  // React Query v5 rejects `undefined` as cached data, and "not found" is a legitimate
  // answer here — not an error. `null` is what crosses the cache; the hook hands the UI
  // back `undefined`, so the screen's absent-case contract is unchanged.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.CollectionDetail, handle],
    queryFn: async () => (await collectionService.productsByHandle(String(handle))) ?? null,
    enabled: Boolean(handle),
  });

  return {
    products: data?.products ?? [],
    title: data?.collection.title,
    isLoading,
    error,
    refetch,
  };
}
