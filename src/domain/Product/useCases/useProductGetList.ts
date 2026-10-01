import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@infra';

import { productService } from '../productService';

export function useProductGetList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductList],
    queryFn: () => productService.list(),
  });

  return {
    products: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
