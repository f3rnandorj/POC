import { northstar } from './northstar';
import type { MerchantConfig } from '../merchantTypes';

/**
 * A second merchant, fictional. It exists to prove the claim that onboarding one is a config
 * entry — every layer of variation is exercised at once:
 *
 * - **accent** overridden, so the identity changes without a theme edit;
 * - **`winterCollection` off**, so a capability this merchant did not buy leaves no trace;
 * - **`material` mapped to `fabric_type`**, a key this catalogue does not define — the line
 *   disappears, which is what proves the adapter resolves through the map and not through a
 *   hardcoded key.
 *
 * ponytail: credentials are reused from the live merchant because the POC has exactly one dev
 * store. That is a stand-in, not a claim — a real second merchant brings its own store and
 * token, and both arrive from the platform endpoint described in `getMerchantConfig`.
 */
export const atlas: MerchantConfig = {
  id: 'atlas',
  credentials: northstar.credentials,
  theme: {
    primaryColor: '#4D7CFE',
  },
  features: {
    winterCollection: false,
    productCare: true,
    brandStory: false,
  },
  metafields: {
    badge: { namespace: 'custom', key: 'badge' },
    material: { namespace: 'custom', key: 'fabric_type' },
    promotionText: { namespace: 'custom', key: 'promotion_text' },
    careInstructions: { namespace: 'custom', key: 'care_instructions' },
  },
  metaobjects: {},
  labels: {
    winterCollection: 'SEASONAL',
    productCare: 'Care guide',
  },
};
