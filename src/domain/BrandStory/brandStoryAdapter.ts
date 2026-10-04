import type { MetaobjectFieldMap } from "@config";

import type {
  BrandStory,
  BrandStoryApi,
  MetaobjectFieldApi,
  MetaobjectNodeApi,
} from "./brandStoryTypes";

/** The field array's order is not a contract, so this indexes by key. */
function toBrandStory(
  response: BrandStoryApi,
  fields: MetaobjectFieldMap,
): BrandStory | undefined {
  const [edge] = response.metaobjects.edges;

  if (!edge) {
    return undefined;
  }

  const byKey = indexByKey(edge.node);

  return {
    title: readText(find(byKey, fields.title)),
    body: readText(find(byKey, fields.body)),
    image: readImage(find(byKey, fields.image)),
  };
}

function find(
  byKey: Map<string, MetaobjectFieldApi>,
  key?: string,
): MetaobjectFieldApi | undefined {
  return key ? byKey.get(key) : undefined;
}

function indexByKey(node: MetaobjectNodeApi): Map<string, MetaobjectFieldApi> {
  const byKey = new Map<string, MetaobjectFieldApi>();

  for (const field of node.fields) {
    byKey.set(field.key, field);
  }

  return byKey;
}

/** An empty string is an absent value, not a value to render. */
function readText(field?: MetaobjectFieldApi): string | undefined {
  const value = field?.value?.trim();

  return value ? value : undefined;
}

/** `value` is a gid here — only the resolved reference is renderable. */
function readImage(field?: MetaobjectFieldApi): BrandStory["image"] {
  const image = field?.reference?.image;

  return image
    ? { url: image.url, altText: image.altText ?? undefined }
    : undefined;
}

export const brandStoryAdapter = {
  toBrandStory,
};
