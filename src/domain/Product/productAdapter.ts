import type { MetafieldApi } from '@api';

import type {
  Product,
  ProductByHandleApi,
  ProductCareInstructions,
  ProductImage,
  ProductListApi,
  ProductMetafields,
  ProductNodeApi,
  ProductVariant,
} from './productTypes';

function toProduct(node: ProductNodeApi): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? '',
    price: node.priceRange.minVariantPrice,
    images: toImages(node),
    variants: toVariants(node),
    metafields: toMetafields(node.metafields),
  };
}

function toProductList(response: ProductListApi): Product[] {
  return response.products.edges.map(edge => toProduct(edge.node));
}

function toProductDetail(response: ProductByHandleApi): Product | undefined {
  return response.product ? toProduct(response.product) : undefined;
}

/**
 * The array is POSITIONAL and holds `null` for every identifier the product does not
 * define — the live Everyday Tee returns five nulls. Indexing by position crashes there,
 * so this builds a key→value map first and reads by key.
 */
function toMetafields(raw: (MetafieldApi | null)[] | null | undefined): ProductMetafields {
  const byKey = new Map<string, MetafieldApi>();

  for (const entry of raw ?? []) {
    if (entry) {
      byKey.set(entry.key, entry);
    }
  }

  return {
    badge: readText(byKey.get('badge')),
    material: readText(byKey.get('material')),
    promotionText: readText(byKey.get('promotion_text')),
    isWinterCollection: readBoolean(byKey.get('is_winter_collection')),
    careInstructions: readJson<ProductCareInstructions>(byKey.get('care_instructions')),
  };
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
  }));
}

/** An empty string is an absent value, not a value to render. */
function readText(metafield?: MetafieldApi): string | undefined {
  const value = metafield?.value?.trim();

  return value ? value : undefined;
}

/** `value` is a string for every metafield type — `"true"` is not `true`. */
function readBoolean(metafield?: MetafieldApi): boolean | undefined {
  return metafield ? metafield.value === 'true' : undefined;
}

/**
 * A JSON metafield is merchant-authored free-form text that reaches the device unvalidated.
 * A malformed value degrades to an absent section — never to a throw that kills the screen.
 */
function readJson<T>(metafield?: MetafieldApi): T | undefined {
  if (!metafield?.value) {
    return undefined;
  }

  try {
    return JSON.parse(metafield.value) as T;
  } catch {
    return undefined;
  }
}

export const productAdapter = {
  toProduct,
  toProductList,
  toProductDetail,
  toMetafields,
};
