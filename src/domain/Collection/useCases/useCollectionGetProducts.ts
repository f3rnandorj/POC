import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "@infra";

import { collectionService } from "../collectionService";

/** No handle means the caller wants the whole catalog, and this query never runs. */
export function useCollectionGetProducts(handle?: string) {
  // React Query v5 rejects `undefined` as cached data, so "not found" crosses it as `null`.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.CollectionDetail, handle],
    queryFn: async () =>
      (await collectionService.productsByHandle(String(handle))) ?? null,
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
