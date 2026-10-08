import type { StoryBlock } from "@config";
import { metaobjectSource } from "@config";

import type { ResolvedStory } from "../contentTypes";

import { metaobjectAdapter } from "./metaobjectAdapter";
import { metaobjectApi } from "./metaobjectApi";

async function storiesByBlock(block: StoryBlock): Promise<ResolvedStory[]> {
  const source = metaobjectSource(block.source.ref);
  const response = await metaobjectApi.listByType(
    source.type,
    source.first ?? METAOBJECT_PAGE_SIZE,
  );

  return metaobjectAdapter.toStories(response, block.id, source.fields);
}

export const metaobjectService = {
  storiesByBlock,
};

/**
 * ponytail: one page, no cursor. Ceiling is Shopify's 250 per request; a merchant wanting more
 * sections than fit one page is a paginated area, which is a different render anyway.
 */
const METAOBJECT_PAGE_SIZE = 10;
