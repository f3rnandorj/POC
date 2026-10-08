import { shopifyClient } from "@api";

import { METAOBJECT_LIST_QUERY } from "./metaobjectQueries";
import type { MetaobjectListApi } from "./metaobjectTypes";

async function listByType(
  type: string,
  first: number,
): Promise<MetaobjectListApi> {
  return shopifyClient.request<MetaobjectListApi>(METAOBJECT_LIST_QUERY, {
    type,
    first,
  });
}

export const metaobjectApi = {
  listByType,
};
