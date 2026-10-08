import type { MetaobjectFieldMap } from "@config";

import type { ResolvedImage, ResolvedStory } from "../contentTypes";

import type {
  MetaobjectFieldApi,
  MetaobjectListApi,
  MetaobjectNodeApi,
} from "./metaobjectTypes";

function toStories(
  response: MetaobjectListApi,
  blockId: string,
  fields: MetaobjectFieldMap,
): ResolvedStory[] {
  return response.metaobjects.edges.flatMap(edge => {
    const story = toStory(edge.node, blockId, fields);

    return story ? [story] : [];
  });
}

/** Title and body both absent resolves to nothing — an image alone is a wordless section. */
function toStory(
  node: MetaobjectNodeApi,
  blockId: string,
  fields: MetaobjectFieldMap,
): ResolvedStory | undefined {
  const byKey = indexByKey(node);
  const title = readText(find(byKey, fields.title));
  const body = readText(find(byKey, fields.body));

  if (!title && !body) {
    return undefined;
  }

  return {
    id: blockId,
    kind: "story",
    title,
    body,
    image: readImage(find(byKey, fields.image)),
  };
}

function find(
  byKey: Map<string, MetaobjectFieldApi>,
  key?: string,
): MetaobjectFieldApi | undefined {
  return key ? byKey.get(key) : undefined;
}

/** The field array's order is not a contract, so this indexes by key. */
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
function readImage(field?: MetaobjectFieldApi): ResolvedImage | undefined {
  const image = field?.reference?.image;

  return image
    ? { url: image.url, altText: image.altText ?? undefined }
    : undefined;
}

export const metaobjectAdapter = {
  toStories,
};
