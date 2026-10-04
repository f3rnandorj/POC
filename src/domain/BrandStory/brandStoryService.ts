import type { StoryBlock } from "@config";

import { brandStoryAdapter } from "./brandStoryAdapter";
import { brandStoryApi } from "./brandStoryApi";
import type { BrandStory } from "./brandStoryTypes";

async function byBlock(block: StoryBlock): Promise<BrandStory | undefined> {
  const response = await brandStoryApi.byType(block.source.type);

  return brandStoryAdapter.toBrandStory(response, block.source.fields);
}

export const brandStoryService = {
  byBlock,
};
