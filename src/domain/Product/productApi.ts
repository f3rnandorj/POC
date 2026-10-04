import { shopifyClient } from "@api";

import { PRODUCT_BY_HANDLE_QUERY, PRODUCT_LIST_QUERY } from "./productQueries";
import type { ProductByHandleApi, ProductListApi } from "./productTypes";

async function list(first: number): Promise<ProductListApi> {
  return shopifyClient.request<ProductListApi>(PRODUCT_LIST_QUERY, { first });
}

async function byHandle(handle: string): Promise<ProductByHandleApi> {
  return shopifyClient.request<ProductByHandleApi>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
}

export const productApi = {
  list,
  byHandle,
};
