import type {
  BrandStory,
  BrandStoryApi,
  MetaobjectFieldApi,
  MetaobjectNodeApi,
} from './brandStoryTypes';

/**
 * The field array is flat and its order is not a contract, so this indexes by key — the same
 * reason the product adapter never reads a metafield positionally.
 */
function toBrandStory(response: BrandStoryApi): BrandStory | undefined {
  const [edge] = response.metaobjects.edges;

  if (!edge) {
    return undefined;
  }

  const byKey = indexByKey(edge.node);

  return {
    title: readText(byKey.get('title')),
    description: readText(byKey.get('description')),
    image: readImage(byKey.get('image')),
  };
}

function indexByKey(node: MetaobjectNodeApi): Map<string, MetaobjectFieldApi> {
  const byKey = new Map<string, MetaobjectFieldApi>();

  for (const field of node.fields) {
    byKey.set(field.key, field);
  }

  return byKey;
}

/** An empty string is an absent value, not a value to render (quick-rule #5). */
function readText(field?: MetaobjectFieldApi): string | undefined {
  const value = field?.value?.trim();

  return value ? value : undefined;
}

/** `value` is a gid here — only the resolved reference is renderable. */
function readImage(field?: MetaobjectFieldApi): BrandStory['image'] {
  const image = field?.reference?.image;

  return image ? { url: image.url, altText: image.altText ?? undefined } : undefined;
}

export const brandStoryAdapter = {
  toBrandStory,
};
