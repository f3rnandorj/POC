import { shopifyClient } from "@api";

import { BRAND_STORY_QUERY } from "./brandStoryQueries";
import type { BrandStoryApi } from "./brandStoryTypes";

async function byType(type: string): Promise<BrandStoryApi> {
  return shopifyClient.request<BrandStoryApi>(BRAND_STORY_QUERY, { type });
}

export const brandStoryApi = {
  byType,
};
