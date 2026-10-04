import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "@infra";

import { productService } from "../productService";

export function useProductGetDetail(handle: string) {
  // React Query v5 rejects `undefined` as cached data, so "not found" crosses it as `null`.
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
