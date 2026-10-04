import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "@infra";

import { collectionService } from "../collectionService";

export function useCollectionGetList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.CollectionList],
    queryFn: () => collectionService.list(),
  });

  return {
    collections: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
