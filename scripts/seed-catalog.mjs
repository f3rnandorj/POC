#!/usr/bin/env node
/**
 * Seeds the dev store so every screen has something to show.
 *
 * Dev tooling, not app code: nothing under `src/` imports this, and the app keeps talking only
 * to the Storefront API (ADR 2026-09-30 — the Admin API never reaches the device).
 *
 * Run:
 *   set -a; . ./.env; . ~/.config/northstar-poc/admin-token.sh; set +a
 *   node scripts/seed-catalog.mjs
 *
 * The Admin token is read from the environment and never written to `.env`, the repo, or any
 * tracked file (standards/security.md).
 *
 * Idempotent: `productSet` upserts on handle, so a second run updates the same products
 * instead of creating `heavyweight-hoodie-1`.
 */

import { COLLECTIONS, PRODUCTS, RESTYLED } from './catalog.mjs';

const { SHOPIFY_STORE_DOMAIN, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_TOKEN } = process.env;

const PUBLICATION_NAME = 'Northstar Poc Headless';
const SIZE_OPTION = 'Size';
// A single-variant product still needs an option: Shopify rejects variants with no
// `productOptions`, so the default pair Shopify itself generates is passed explicitly.
const DEFAULT_OPTION = 'Title';
const DEFAULT_VALUE = 'Default Title';

async function main() {
  requireEnv();

  const publicationId = await findPublicationId();
  console.log(`→ publishing to "${PUBLICATION_NAME}" (${publicationId})\n`);

  const collectionIds = await findCollectionIds();

  for (const product of PRODUCTS) {
    const id = await upsertProduct(product, collectionIds);
    await publish(id, publicationId);
    console.log(`  ✓ ${product.handle}`);
  }

  console.log('');

  for (const { handle, image } of RESTYLED) {
    await restylePhoto(handle, image);
    console.log(`  ✓ restyled ${handle}`);
  }

  console.log('');

  for (const collection of COLLECTIONS) {
    const id = await setCollectionImage(collection);
    await publish(id, publicationId);
    console.log(`  ✓ collection ${collection.handle}`);
  }

  console.log('\nSeed complete. Verify through the Storefront API, not the admin.');
}

/**
 * One call per product. `productSet` takes options, variants, media and metafields together, so
 * the two-step `productCreate` + `productVariantsBulkCreate` dance is not needed.
 *
 * `identifier` is what makes it an upsert — without it the mutation always creates, and a second
 * run fails on "handle already in use" instead of updating.
 */
async function upsertProduct(product, collectionIds) {
  const data = await admin(
    `mutation Upsert($identifier: ProductSetIdentifiers!, $input: ProductSetInput!) {
      productSet(synchronous: true, identifier: $identifier, input: $input) {
        product { id }
        userErrors { field message }
      }
    }`,
    { identifier: { handle: product.handle }, input: toProductInput(product, collectionIds) },
  );

  const { product: saved, userErrors } = data.productSet;

  if (userErrors.length > 0) {
    throw new Error(`${product.handle}: ${userErrors.map(formatError).join('; ')}`);
  }

  return saved.id;
}

function toProductInput(product, collectionIds) {
  const sizes = product.sizes ?? [];

  return {
    handle: product.handle,
    // Membership is declared here rather than through `collectionAddProducts`, so a product
    // moved between collections in `catalog.mjs` is corrected on the next run instead of
    // accumulating in both.
    collections: (product.collections ?? []).map(handle => collectionIds[handle]),
    title: product.title,
    descriptionHtml: `<p>${product.description}</p>`,
    productType: product.productType,
    vendor: 'Northstar',
    status: 'ACTIVE',
    files: [{ originalSource: product.image, contentType: 'IMAGE', alt: product.title }],
    metafields: toMetafields(product.metafields),
    productOptions:
      sizes.length > 0
        ? [{ name: SIZE_OPTION, values: sizes.map(toOptionValue) }]
        : [{ name: DEFAULT_OPTION, values: [{ name: DEFAULT_VALUE }] }],
    variants: sizes.length > 0 ? sizes.map(size => toVariant(product, size)) : [toVariant(product)],
  };
}

function toVariant(product, size) {
  const isSoldOut = size !== undefined && (product.soldOut ?? []).includes(size);

  return {
    price: product.variantPrices?.[size] ?? product.price,
    optionValues:
      size === undefined
        ? [{ optionName: DEFAULT_OPTION, name: DEFAULT_VALUE }]
        : [{ optionName: SIZE_OPTION, name: size }],
    inventoryPolicy: 'DENY',
    // ponytail: availability is expressed by tracking, not by stock counts. A tracked variant
    // starts at zero and reads as sold out; an untracked one is always available. Writing real
    // quantities needs `read_locations` plus a location id, which buys nothing for a demo —
    // add both the day inventory numbers actually matter.
    inventoryItem: { tracked: isSoldOut },
  };
}

function toMetafields(metafields = {}) {
  return Object.entries(metafields).map(([key, value]) => ({
    namespace: 'custom',
    key,
    type: TYPES[key],
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));
}

async function setCollectionImage(collection) {
  const found = await admin(
    `query Find($handle: String!) { collectionByHandle(handle: $handle) { id } }`,
    { handle: collection.handle },
  );

  if (!found.collectionByHandle) {
    throw new Error(`collection "${collection.handle}" does not exist — create it in the admin first`);
  }

  const data = await admin(
    `mutation Cover($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id }
        userErrors { field message }
      }
    }`,
    { input: { id: found.collectionByHandle.id, image: { src: collection.image } } },
  );

  if (data.collectionUpdate.userErrors.length > 0) {
    throw new Error(
      `${collection.handle}: ${data.collectionUpdate.userErrors.map(formatError).join('; ')}`,
    );
  }

  return found.collectionByHandle.id;
}

/**
 * The step that silently breaks everything. A product saved but unpublished is invisible to the
 * Storefront API, and the app then looks broken for a reason nothing in the code explains.
 */
async function publish(id, publicationId) {
  const data = await admin(
    `mutation Publish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id, input: [{ publicationId }] },
  );

  if (data.publishablePublish.userErrors.length > 0) {
    throw new Error(data.publishablePublish.userErrors.map(formatError).join('; '));
  }
}

/** Handle → gid, so `catalog.mjs` can name collections the way the store does. */
/**
 * Puts a new photo in front of a product the script did not create, leaving its copy, price,
 * variants and metafields untouched. The original image is reordered behind the new one, never
 * removed — a seed run does not destroy anything the user uploaded.
 */
async function restylePhoto(handle, image) {
  const found = await admin(
    `query Find($handle: String!) { productByHandle(handle: $handle) { id } }`,
    { handle },
  );

  if (!found.productByHandle) {
    throw new Error(`product "${handle}" does not exist — it is expected to predate this script`);
  }

  const { id } = found.productByHandle;

  const created = await admin(
    `mutation AddPhoto($id: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $id, media: $media) {
        media { ... on MediaImage { id } }
        mediaUserErrors { field message }
      }
    }`,
    { id, media: [{ originalSource: image, mediaContentType: 'IMAGE', alt: handle }] },
  );

  if (created.productCreateMedia.mediaUserErrors.length > 0) {
    throw new Error(created.productCreateMedia.mediaUserErrors.map(formatError).join('; '));
  }

  const data = await admin(
    `mutation Reorder($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) {
        userErrors { field message }
      }
    }`,
    { id, moves: [{ id: created.productCreateMedia.media[0].id, newPosition: '0' }] },
  );

  if (data.productReorderMedia.userErrors.length > 0) {
    throw new Error(data.productReorderMedia.userErrors.map(formatError).join('; '));
  }
}

async function findCollectionIds() {
  const entries = await Promise.all(
    COLLECTIONS.map(async ({ handle }) => {
      const data = await admin(
        `query Find($handle: String!) { collectionByHandle(handle: $handle) { id } }`,
        { handle },
      );

      if (!data.collectionByHandle) {
        throw new Error(`collection "${handle}" does not exist — create it in the admin first`);
      }

      return [handle, data.collectionByHandle.id];
    }),
  );

  return Object.fromEntries(entries);
}

async function findPublicationId() {
  const data = await admin(`{ publications(first: 20) { edges { node { id name } } } }`);
  const match = data.publications.edges.find(edge => edge.node.name === PUBLICATION_NAME);

  if (!match) {
    throw new Error(`publication "${PUBLICATION_NAME}" not found — check the store's sales channels`);
  }

  return match.node.id;
}

async function admin(query, variables) {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const body = await response.json();

  // The Admin API answers 200 with a top-level `errors` array, exactly like the Storefront one.
  if (body.errors) {
    throw new Error(JSON.stringify(body.errors));
  }

  return body.data;
}

function toOptionValue(size) {
  return { name: size };
}

function formatError(error) {
  return `${(error.field ?? []).join('.')} ${error.message}`.trim();
}

function requireEnv() {
  const missing = ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_API_VERSION', 'SHOPIFY_ADMIN_TOKEN'].filter(
    key => !process.env[key],
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(', ')} — source .env and ~/.config/northstar-poc/admin-token.sh first.`,
    );
  }
}

/** Must match each definition in the admin; a mismatch is rejected rather than coerced. */
const TYPES = {
  badge: 'single_line_text_field',
  material: 'single_line_text_field',
  promotion_text: 'single_line_text_field',
  is_winter_collection: 'boolean',
  care_instructions: 'json',
};

main().catch(error => {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
});
