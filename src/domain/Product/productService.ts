import { productAdapter } from './productAdapter';
import { productApi } from './productApi';
import type { Product } from './productTypes';

const DEFAULT_LIST_SIZE = 20;

async function list(first = DEFAULT_LIST_SIZE): Promise<Product[]> {
  const response = await productApi.list(first);

  return productAdapter.toProductList(response);
}

async function byHandle(handle: string): Promise<Product | undefined> {
  const response = await productApi.byHandle(handle);

  return productAdapter.toProductDetail(response);
}

export const productService = {
  list,
  byHandle,
};
