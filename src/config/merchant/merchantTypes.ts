export interface MerchantConfig {
  id: string;
  credentials: MerchantCredentials;
  theme: MerchantTheme;
  features: MerchantFeatures;
  /**
   * Domain concept → Shopify identifier. The query is built from this map and the adapter
   * resolves values through it, so a merchant whose keys differ is a config entry and never
   * a query or adapter edit (standards/shopify.md, metafield contract rule 4).
   */
  metafields: MerchantMetafieldMap;
  /** Standalone merchant content, keyed the same way: concept → Shopify metaobject type. */
  metaobjects: MerchantMetaobjectMap;
  labels: MerchantLabels;
}

export interface MerchantCredentials {
  storeDomain: string;
  storefrontToken: string;
  apiVersion: string;
}

export interface MerchantTheme {
  /** Overrides the base `accent` token and nothing else (standards/design.md). */
  primaryColor?: string;
}

export interface MerchantFeatures {
  winterCollection: boolean;
  productCare: boolean;
  brandStory: boolean;
}

export interface MerchantLabels {
  winterCollection: string;
  productCare: string;
}

/**
 * The domain concepts a merchant may map. Declared here rather than derived from
 * `ProductMetafields` because config sits below the domain — the dependency runs one way.
 */
export type MetafieldConcept =
  | 'badge'
  | 'material'
  | 'promotionText'
  | 'isWinterCollection'
  | 'careInstructions';

/** A concept the merchant omits is never requested, and reaches the UI as `undefined`. */
export type MerchantMetafieldMap = Partial<Record<MetafieldConcept, MetafieldIdentifier>>;

export type MetaobjectConcept = 'brandStory';

export type MerchantMetaobjectMap = Partial<Record<MetaobjectConcept, string>>;

export interface MetafieldIdentifier {
  namespace: string;
  key: string;
}
