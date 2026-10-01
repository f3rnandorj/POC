import { shopifyClient } from '@api';

import { COLLECTION_LIST_QUERY, COLLECTION_PRODUCTS_QUERY } from './collectionQueries';
import type { CollectionListApi, CollectionProductsApi } from './collectionTypes';

async function list(first: number): Promise<CollectionListApi> {
  return shopifyClient.request<CollectionListApi>(COLLECTION_LIST_QUERY, { first });
}

async function productsByHandle(handle: string, first: number): Promise<CollectionProductsApi> {
  return shopifyClient.request<CollectionProductsApi>(COLLECTION_PRODUCTS_QUERY, {
    handle,
    first,
  });
}

export const collectionApi = {
  list,
  productsByHandle,
};
