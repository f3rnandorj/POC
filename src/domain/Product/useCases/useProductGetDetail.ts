import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@infra';

import { productService } from '../productService';

export function useProductGetDetail(handle: string) {
  // React Query v5 rejects `undefined` as cached data, and "not found" is a legitimate
  // answer here — not an error. `null` is what crosses the cache; the hook hands the UI
  // back `undefined`, so the screen's absent-case contract is unchanged.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductDetail, handle],
    queryFn: async () => (await productService.byHandle(handle)) ?? null,
    enabled: Boolean(handle),
  });

  return {
    product: data ?? undefined,
    isLoading,
    error,
    refetch,
  };
}
