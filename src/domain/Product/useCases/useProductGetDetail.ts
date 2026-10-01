import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@infra';

import { productService } from '../productService';

export function useProductGetDetail(handle: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductDetail, handle],
    queryFn: () => productService.byHandle(handle),
    enabled: Boolean(handle),
  });

  return {
    product: data,
    isLoading,
    error,
    refetch,
  };
}
