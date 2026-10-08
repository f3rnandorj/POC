import type { MetafieldApi } from "@api";
import type {
  BadgeBlock,
  ContentBlock,
  LabelValueBlock,
  MetafieldBlock,
} from "@config";
import { productDetailAreas } from "@config";

import type {
  ResolvedBadge,
  ResolvedBlock,
  ResolvedItem,
  ResolvedLabelValueSection,
} from "../contentTypes";

import type {
  Product,
  ProductByHandleApi,
  ProductImage,
  ProductListApi,
  ProductNodeApi,
  ProductVariant,
} from "./productTypes";

function toProduct(node: ProductNodeApi): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    price: node.priceRange.minVariantPrice,
    images: toImages(node),
    variants: toVariants(node),
    blocks: toBlocks(node.metafields),
  };
}

function toProductList(response: ProductListApi): Product[] {
  return response.products.edges.map(edge => toProduct(edge.node));
}

function toProductDetail(response: ProductByHandleApi): Product | undefined {
  return response.product ? toProduct(response.product) : undefined;
}

/**
 * Shopify returns a POSITIONAL array holding `null` for every identifier the product does not
 * define, so this indexes by identifier and reads by block.
 *
 * Flat, not grouped by area: a story declared in the same area is resolved from a metaobject, and
 * grouping both at once is `toAreaContent`'s job.
 */
function toBlocks(
  raw: (MetafieldApi | null)[] | null | undefined,
): ResolvedBlock[] {
  const byIdentifier = indexByIdentifier(raw);

  return productDetailAreas().flatMap(([, blocks]) =>
    blocks.flatMap(block => {
      const resolved = resolveBlock(block, byIdentifier);

      return resolved ? [resolved] : [];
    }),
  );
}

function resolveBlock(
  block: ContentBlock,
  byIdentifier: Map<string, MetafieldApi>,
): ResolvedBlock | undefined {
  switch (block.kind) {
    case "badge":
      return resolveBadge(block, metafieldOf(block, byIdentifier));

    case "textLine": {
      const text = readText(metafieldOf(block, byIdentifier));

      return text ? { id: block.id, kind: "textLine", text } : undefined;
    }

    case "labelValueSection":
      return resolveSection(block, metafieldOf(block, byIdentifier));

    // A story reads a metaobject, not this product: the Metaobject domain resolves it.
    case "story":
      return undefined;
  }
}

function metafieldOf(
  block: MetafieldBlock,
  byIdentifier: Map<string, MetafieldApi>,
): MetafieldApi | undefined {
  return byIdentifier.get(toIdentifier(block.source));
}

function resolveBadge(
  block: BadgeBlock,
  metafield?: MetafieldApi,
): ResolvedBadge | undefined {
  const text =
    block.source.as === "boolean"
      ? readFlagLabel(block, metafield)
      : readText(metafield);

  return text ? { id: block.id, kind: "badge", text } : undefined;
}

/** `true` renders the block's own label; `false` and absent both render nothing. */
function readFlagLabel(
  block: BadgeBlock,
  metafield?: MetafieldApi,
): string | undefined {
  return readBoolean(metafield) ? block.label : undefined;
}

function resolveSection(
  block: LabelValueBlock,
  metafield?: MetafieldApi,
): ResolvedLabelValueSection | undefined {
  const parsed = readJson(metafield);

  if (!parsed) {
    return undefined;
  }

  const items = block.fields.flatMap<ResolvedItem>(field => {
    const value = readFieldValue(parsed[field.key]);

    return value ? [{ label: field.label, value }] : [];
  });

  return items.length > 0
    ? { id: block.id, kind: "labelValueSection", title: block.label, items }
    : undefined;
}

function toImages(node: ProductNodeApi): ProductImage[] {
  return node.images.edges.map(edge => ({
    url: edge.node.url,
    altText: edge.node.altText ?? undefined,
  }));
}

function toVariants(node: ProductNodeApi): ProductVariant[] {
  return (node.variants?.edges ?? []).map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    isAvailable: edge.node.availableForSale,
    stockLimit: toStockLimit(edge.node.quantityAvailable),
    image: edge.node.image
      ? {
          url: edge.node.image.url,
          altText: edge.node.image.altText ?? undefined,
        }
      : undefined,
  }));
}

/** Zero means "not counted" as often as it means "none left", so only a positive count is a cap. */
function toStockLimit(quantityAvailable?: number | null): number | undefined {
  return quantityAvailable && quantityAvailable > 0
    ? quantityAvailable
    : undefined;
}

/** `key` alone is not an identifier: `custom.badge` and `promo.badge` are different metafields. */
function toIdentifier(source: { namespace: string; key: string }): string {
  return `${source.namespace}:${source.key}`;
}

function indexByIdentifier(raw: (MetafieldApi | null)[] | null | undefined) {
  const byIdentifier = new Map<string, MetafieldApi>();

  for (const entry of raw ?? []) {
    if (entry) {
      byIdentifier.set(toIdentifier(entry), entry);
    }
  }

  return byIdentifier;
}

/** An empty string is an absent value, not a value to render. */
function readText(metafield?: MetafieldApi): string | undefined {
  const value = metafield?.value?.trim();

  return value ? value : undefined;
}

/** `value` is a string for every metafield type — `"true"` is not `true`. */
function readBoolean(metafield?: MetafieldApi): boolean | undefined {
  return metafield ? metafield.value === "true" : undefined;
}

/** Merchant-authored and unvalidated: malformed or non-object degrades to absent, never throws. */
function readJson(
  metafield?: MetafieldApi,
): Record<string, unknown> | undefined {
  if (!metafield?.value) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(metafield.value);

    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Only text and finite numbers are renderable: a non-string child crashes `<Text>` in RN. */
function readFieldValue(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

export const productAdapter = {
  toProduct,
  toProductList,
  toProductDetail,
  toBlocks,
};
