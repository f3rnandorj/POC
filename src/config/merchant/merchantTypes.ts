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
  /** Copy the UI renders verbatim — a merchant renaming a section is a config change. */
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
}

export interface MetafieldIdentifier {
  namespace: string;
  key: string;
}
