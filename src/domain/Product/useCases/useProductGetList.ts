import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@infra';

import { productService } from '../productService';

/** `enabled` lets a caller that is scoped to a collection skip the whole-catalog request. */
export function useProductGetList(enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductList],
    queryFn: () => productService.list(),
    enabled,
  });

  return {
    products: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
