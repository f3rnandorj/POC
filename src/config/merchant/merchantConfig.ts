import { getActiveMerchantId } from "./activeMerchant";
import { atlas } from "./merchants/atlas";
import { northstar } from "./merchants/northstar";
import type {
  AreaBlocks,
  ContentBlock,
  HomeArea,
  HomeLayout,
  MerchantConfig,
  MerchantId,
  MetafieldBlock,
  MetaobjectSource,
  ProductDetailArea,
  ProductDetailLayout,
  StoryBlock,
} from "./merchantTypes";

/** Never captured in a constant: the active merchant changes at runtime. */
export function merchantConfig(): MerchantConfig {
  return getMerchantConfig(getActiveMerchantId());
}

export function getMerchantConfig(merchantId: string): MerchantConfig {
  const merchant = MERCHANTS[merchantId];

  if (!merchant) {
    throw new Error(
      `Unknown merchant "${merchantId}" — add its config under config/merchant/merchants/.`,
    );
  }

  assertCredentials(merchant);

  return merchant;
}

export function homeLayout(): HomeLayout {
  const layout = merchantConfig().screens.home?.layout;

  return {
    mainProductRow: layout?.mainProductRow ?? "single",
    collections: layout?.collections ?? "inline",
  };
}

export function productDetailLayout(): ProductDetailLayout {
  const layout = merchantConfig().screens.productDetail?.layout;

  return {
    media: layout?.media ?? "gallery",
  };
}

export function homeMainProductRowTitle(): string | undefined {
  return merchantConfig().screens.home?.mainProductRowTitle;
}

export function homeAreas(): AreaBlocks<HomeArea>[] {
  const screen = merchantConfig().screens.home;

  return declaredAreas(screen?.metaobjects) as AreaBlocks<HomeArea>[];
}

export function productDetailAreas(): AreaBlocks<ProductDetailArea>[] {
  const screen = merchantConfig().screens.productDetail;

  // Positions never repeat across the two groups, so one flat list stays one area per key.
  return [
    ...declaredAreas(screen?.metafields),
    ...declaredAreas(screen?.metaobjects),
  ] as AreaBlocks<ProductDetailArea>[];
}

export function metaobjectSource(ref: string): MetaobjectSource {
  const source = merchantConfig().metaobjectSources?.[ref];

  if (!source) {
    throw new Error(
      `Unknown metaobject source "${ref}" — declare it under metaobjectSources in ` +
        "config/merchant/merchants/{merchant}.ts.",
    );
  }

  return source;
}

export function storyBlocksIn(areas: AreaBlocks[]): StoryBlock[] {
  return areas.flatMap(([, blocks]) => blocks.filter(isStoryBlock));
}

// ponytail: local record stands in for the platform endpoint (OAuth install → server-side token).
// Upgrade path: fetch this shape at startup — and then validate it, since a parsed payload is not
// type-checked the way these literals are.
const MERCHANTS: Record<string, MerchantConfig> = {
  [northstar.id]: northstar,
  [atlas.id]: atlas,
};

export const merchantIds = Object.keys(MERCHANTS) as MerchantId[];

/**
 * Every declared merchant's, not just the active one's: the product document is a template
 * literal built once at import, so a merchant switched in afterwards would query stale keys.
 *
 * ponytail: ceiling is Shopify's 250 identifiers per query. Past that, build the document per
 * merchant — the fragments and the query documents become functions.
 */
export const queriedMetafieldBlocks: MetafieldBlock[] = Object.values(
  MERCHANTS,
).flatMap(merchant =>
  declaredAreas(merchant.screens.productDetail?.metafields).flatMap(
    ([, blocks]) => blocks.filter(isMetafieldBlock),
  ),
);

/** Selected merchant only: validating every imported config would block a one-token dev. */
function assertCredentials(merchant: MerchantConfig): void {
  const prefix = merchant.id.toUpperCase();
  const { storeDomain, storefrontToken, apiVersion } = merchant.credentials;

  const missing = [
    storeDomain ? undefined : `${prefix}_STORE_DOMAIN`,
    storefrontToken ? undefined : `${prefix}_STOREFRONT_TOKEN`,
    apiVersion ? undefined : "SHOPIFY_API_VERSION",
  ].filter((key): key is string => key !== undefined);

  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(
        ", ",
      )} in .env — copy .env.example and fill it from the Shopify ` +
        "admin, then rebuild: react-native-config reads .env at build time, not at reload.",
    );
  }
}

function declaredAreas(screen: object = {}): AreaBlocks[] {
  return Object.entries(screen).filter(isArea);
}

function isArea(entry: [string, unknown]): entry is AreaBlocks {
  return Array.isArray(entry[1]) && entry[1].length > 0;
}

function isStoryBlock(block: ContentBlock): block is StoryBlock {
  return block.kind === "story";
}

function isMetafieldBlock(block: ContentBlock): block is MetafieldBlock {
  return block.source.from === "metafield";
}
