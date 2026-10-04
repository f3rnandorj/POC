import { getActiveMerchantId } from "./activeMerchant";
import { atlas } from "./merchants/atlas";
import { northstar } from "./merchants/northstar";
import type {
  MerchantConfig,
  MerchantId,
  MerchantLayout,
  ProductBlock,
  ProductDetailArea,
  ProductDetailAreaBlocks,
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

export function merchantLayout(): MerchantLayout {
  const { layout } = merchantConfig();

  return {
    productRow: layout?.productRow ?? "single",
    collections: layout?.collections ?? "inline",
    detail: layout?.detail ?? "single",
  };
}

/** Absent means the row renders with no heading. */
export function homeProductRowTitle(): string | undefined {
  return merchantConfig().screens.home?.productRow;
}

/** Absent means this merchant issues no story query at all. */
export function homeFooterStory(): StoryBlock | undefined {
  return merchantConfig().screens.home?.footer;
}

/**
 * Each area paired with its blocks, in declaration order, so neither the adapter nor the screen
 * names an area. An empty area is dropped here rather than resolved to nothing.
 */
export function productDetailAreas(): ProductDetailAreaBlocks[] {
  return Object.entries(declaredAreas(merchantConfig())).filter(hasBlocks);
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
export const queriedMetafieldBlocks: ProductBlock[] = Object.values(
  MERCHANTS,
).flatMap(merchant =>
  Object.values(declaredAreas(merchant)).flatMap(blocks => blocks ?? []),
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

/** Widened so the areas can be walked as entries — each key accepts only its own kinds. */
function declaredAreas(
  merchant: MerchantConfig,
): Partial<Record<ProductDetailArea, ProductBlock[]>> {
  return merchant.screens.productDetail ?? {};
}

function hasBlocks(
  entry: [string, ProductBlock[] | undefined],
): entry is ProductDetailAreaBlocks {
  return Boolean(entry[1]?.length);
}
