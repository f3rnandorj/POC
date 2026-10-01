import { collectionAdapter } from './collectionAdapter';
import { collectionApi } from './collectionApi';
import type { Collection, CollectionProducts } from './collectionTypes';

const DEFAULT_LIST_SIZE = 20;
const DEFAULT_PRODUCTS_SIZE = 20;

async function list(first = DEFAULT_LIST_SIZE): Promise<Collection[]> {
  const response = await collectionApi.list(first);

  return collectionAdapter.toCollectionList(response);
}

async function productsByHandle(
  handle: string,
  first = DEFAULT_PRODUCTS_SIZE,
): Promise<CollectionProducts | undefined> {
  const response = await collectionApi.productsByHandle(handle, first);

  return collectionAdapter.toCollectionProducts(response);
}

export const collectionService = {
  list,
  productsByHandle,
};
