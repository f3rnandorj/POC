import { useQuery } from "@tanstack/react-query";

import { productDetailAreas, storyBlocksIn } from "@config";
import { QueryKeys } from "@infra";

import { toAreaContent } from "../../contentAreas";
import { useMetaobjectGetBlocks } from "../../Metaobject";
import { productService } from "../productService";

export function useProductGetDetail(handle: string) {
  // React Query v5 rejects `undefined` as cached data, so "not found" crosses it as `null`.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductDetail, handle],
    queryFn: async () => (await productService.byHandle(handle)) ?? null,
    enabled: Boolean(handle),
  });

  // Two sources, one set of areas: the product's metafields and, where the merchant declared one,
  // the store's metaobjects. The declaration decides the area and the order for both.
  const areas = productDetailAreas();
  const { blocks: stories } = useMetaobjectGetBlocks(storyBlocksIn(areas));

  return {
    product: data ?? undefined,
    content: toAreaContent(areas, [...(data?.blocks ?? []), ...stories]),
    isLoading,
    error,
    refetch,
  };
}
