import Config from 'react-native-config';

import type { MerchantConfig } from './merchantTypes';

/**
 * The single consumer of the Storefront environment variables in the whole tree
 * (standards/security.md). Everything else reads this object.
 */
export const merchantConfig: MerchantConfig = {
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
    brandStory: false,
  },
  metafieldIdentifiers: [
    { namespace: 'custom', key: 'badge' },
    { namespace: 'custom', key: 'material' },
    { namespace: 'custom', key: 'promotion_text' },
    { namespace: 'custom', key: 'is_winter_collection' },
  ],
};

/**
 * Fails loudly at startup instead of letting an empty token reach the Storefront as a
 * 401 three screens later. The message names the key only — never the value.
 */
function requireEnv(key: keyof typeof Config): string {
  const value = Config[key];

  if (!value) {
    throw new Error(
      `Missing ${String(key)} in .env — copy .env.example and fill it from the Shopify admin.`,
    );
  }

  return value;
}
