export interface MerchantConfig {
  id: string;
  credentials: MerchantCredentials;
  theme: MerchantTheme;
  features: MerchantFeatures;
  /**
   * Metafield identifiers live here so a merchant using different keys is a config
   * change, never a query edit (standards/shopify.md, metafield contract rule 4).
   */
  metafieldIdentifiers: MetafieldIdentifier[];
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

export interface MetafieldIdentifier {
  namespace: string;
  key: string;
}
