import { atlas } from './merchants/atlas';
import { northstar } from './merchants/northstar';
import type { MerchantConfig } from './merchantTypes';

/**
 * The single switch. Change this id and the catalogue, the enabled capabilities, the metafield
 * keys and the accent all follow — nothing else in the tree is edited.
 */
const ACTIVE_MERCHANT_ID = 'northstar';

export function getMerchantConfig(merchantId: string): MerchantConfig {
  const merchant = MERCHANTS[merchantId];

  if (!merchant) {
    throw new Error(
      `Unknown merchant "${merchantId}" — add its config under config/merchant/merchants/.`,
    );
  }

  return merchant;
}

/**
 * ponytail: a local record stands in for the platform endpoint. In production the app installs
 * through Shopify OAuth, the platform stores the merchant's token server-side and returns this
 * same shape at startup — the type is the contract, the lookup is the stub.
 */
const MERCHANTS: Record<string, MerchantConfig> = {
  [northstar.id]: northstar,
  [atlas.id]: atlas,
};

/** Everything downstream reads this object and never the record above. */
export const merchantConfig = getMerchantConfig(ACTIVE_MERCHANT_ID);
