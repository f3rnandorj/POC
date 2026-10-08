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

/**
 * Resolved on every call, never captured: the active merchant changes at runtime
 * (`activeMerchant.ts`), so a module constant would keep serving the previous store.
 */
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

/** Each screen resolves its own arrangement, with the base one for every key left out. */
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

/** Absent means the row renders with no heading. */
export function homeMainProductRowTitle(): string | undefined {
  return merchantConfig().screens.home?.mainProductRowTitle;
}

/**
 * The home positions paired with their blocks. Every one of them is metaobject-backed, so an
 * empty result is a merchant that issues no metaobject query at all.
 */
export function homeAreas(): AreaBlocks<HomeArea>[] {
  const screen = merchantConfig().screens.home;

  return declaredAreas(screen?.metaobjects) as AreaBlocks<HomeArea>[];
}

/**
 * Each area paired with its blocks, in declaration order, so neither the adapter nor the screen
 * names an area. An empty area is dropped here rather than resolved to nothing.
 */
export function productDetailAreas(): AreaBlocks<ProductDetailArea>[] {
  const screen = merchantConfig().screens.productDetail;

  // Both groups in one list: positions never repeat across them, so the result stays one area per
  // key and whoever walks it never has to know which source a position is fed from.
  return [
    ...declaredAreas(screen?.metafields),
    ...declaredAreas(screen?.metaobjects),
  ] as AreaBlocks<ProductDetailArea>[];
}

/**
 * What a `story` block points at. A ref with no entry is a config error, and it surfaces as that
 * block's query failing rather than as a screen rendering one section short in silence.
 */
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

/** The story blocks declared across those areas — what the metaobject resolver fetches. */
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

/** The stores the demo switch offers. */
export const merchantIds = Object.keys(MERCHANTS) as MerchantId[];

/**
 * The metafield identifiers the product document asks for — **every** declared merchant's, not
 * just the active one's. The document is a template literal built once at import, so a merchant
 * switched in afterwards would otherwise query the previous merchant's keys. Harmless: the adapter
 * indexes the response by identifier and resolves only the active merchant's blocks, and an
 * identifier the product does not define comes back null and is dropped.
 *
 * ponytail: ceiling is Shopify's 250 identifiers per query. Past that, build the document per
 * merchant — the fragments and the query documents become functions.
 */
export const queriedMetafieldBlocks: MetafieldBlock[] = Object.values(
  MERCHANTS,
).flatMap(merchant =>
  declaredAreas(merchant.screens.productDetail?.metafields).flatMap(([, blocks]) =>
    blocks.filter(isMetafieldBlock),
  ),
);

/**
 * Selected merchant only: every module is imported to build the record, so validating at that
 * scope would stop a developer holding one merchant's token from booting. Names keys, not values.
 */
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

/**
 * One group's areas as entries, in declaration order. An area is a key holding a list of blocks,
 * so a heading (a string) is skipped without being named here — the shape says it, and a key the
 * app grows later needs no edit. An empty area is dropped rather than resolved to nothing.
 */
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
