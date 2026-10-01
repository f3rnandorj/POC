import { brandStoryAdapter } from './brandStoryAdapter';
import { brandStoryApi } from './brandStoryApi';
import type { BrandStory } from './brandStoryTypes';

async function byType(type: string): Promise<BrandStory | undefined> {
  const response = await brandStoryApi.byType(type);

  return brandStoryAdapter.toBrandStory(response);
}

export const brandStoryService = {
  byType,
};
