import { merchantConfig } from '@config';

import type { GraphQLResponseApi } from './shopifyTypes';

/**
 * The single Storefront transport. `fetch` is built into React Native, so a POST with
 * two headers needs no HTTP dependency.
 */
async function request<TData>(
  document: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const { storeDomain, storefrontToken, apiVersion } = merchantConfig.credentials;

  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query: document, variables }),
  });

  if (!response.ok) {
    throw new ShopifyError(`A loja não respondeu (HTTP ${response.status}). Tente de novo.`);
  }

  const payload = (await response.json()) as GraphQLResponseApi<TData>;

  // Storefront reports query errors with HTTP 200 + a top-level `errors` array, so
  // `response.ok` above is not error handling on its own (standards/shopify.md).
  if (payload.errors?.length) {
    throw new ShopifyError(
      'Não foi possível carregar os dados da loja.',
      payload.errors[0].message
    );
  }

  if (!payload.data) {
    throw new ShopifyError('A loja respondeu sem dados.');
  }

  return payload.data;
}

/**
 * `message` is safe to render; the Storefront text stays in `cause` for the dev console
 * and is never shown to the buyer. The raw payload is deliberately not attached, and the
 * token travels in a header that is never logged (standards/security.md).
 */
export class ShopifyError extends Error {
  readonly cause?: string;

  constructor(message: string, cause?: string) {
    super(message);
    this.name = 'ShopifyError';
    this.cause = cause;
  }
}

export const shopifyClient = {
  request,
};
