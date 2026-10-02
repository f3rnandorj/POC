import Config from 'react-native-config';

import type { MerchantConfig } from '../merchantTypes';

/**
 * The live merchant. The only config whose credentials come from the environment — the
 * Storefront token never appears in a tracked file (standards/security.md).
 */
export const northstar: MerchantConfig = {
  id: 'northstar',
  credentials: {
    storeDomain: requireEnv('SHOPIFY_STORE_DOMAIN'),
    storefrontToken: requireEnv('SHOPIFY_STOREFRONT_TOKEN'),
    apiVersion: requireEnv('SHOPIFY_API_VERSION'),
  },
  theme: {},
  features: {
    winterCollection: true,
    productCare: true,
    brandStory: true,
  },
  metafields: {
    badge: { namespace: 'custom', key: 'badge' },
    material: { namespace: 'custom', key: 'material' },
    promotionText: { namespace: 'custom', key: 'promotion_text' },
    isWinterCollection: { namespace: 'custom', key: 'is_winter_collection' },
    careInstructions: { namespace: 'custom', key: 'care_instructions' },
  },
  metaobjects: {
    brandStory: 'brand_story',
  },
  labels: {
    winterCollection: 'WINTER COLLECTION',
    productCare: 'How to care',
  },
};

/**
 * Fails loudly at startup instead of letting an empty token reach the Storefront as a
 * 401 three screens later. The message names the key only — never the value.
 */
function requireEnv(key: keyof typeof Config): string {
  const value = Config[key];

  if (!value) {
    throw new Error(
      `Missing ${String(key)} in .env — copy .env.example and fill it from the Shopify admin.`
    );
  }

  return value;
}
