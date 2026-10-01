# Shopify — Storefront API, metafields, merchant customization

The project's identity standard. Load it for anything touching Shopify, metafields, variants, collections or merchant-specific behavior.

## Why Storefront API (and not Admin API)

- It is the **buyer-facing** API: read-only product/collection/variant data, safe to call from a device with a public token. The Admin API needs a server-side secret and grants write access the app has no business holding.
- Published metafields are exposed to Storefront, which is exactly the customization channel the merchant controls without a deploy.
- GraphQL lets one request shape the whole Product Detail screen (images + price + variants + metafields) instead of N REST round-trips.

## Client

- One client in `src/api/shopify/client.ts`. Headers: `X-Shopify-Storefront-Access-Token` + `Content-Type: application/json`.
- **Pin the API version** in the endpoint (`/api/2026-01/graphql.json`). An unpinned endpoint silently changes shape.
- Store domain + token come from `src/config/merchant/merchantConfig.ts`, never from a literal in the api file. See `security.md`.
- Errors: Storefront returns HTTP 200 with a top-level `errors` array. The client **must** inspect `errors` and throw — a 200 is not success.

## Query conventions

- Documents live in `src/domain/{Domain}/{domain}Queries.ts`, never inline in a service, hook or screen.
- Shared selections become fragments in `src/api/shopify/fragments.ts` (product card fields, metafield identifiers). Every new screen reuses a fragment instead of restating fields.
- Pagination is `first: N` + `edges { node { ... } }`. The **adapter** flattens edges/nodes — nothing above the adapter knows the word `edges`.
- Money is `MoneyV2 { amount currencyCode }`. Never format inside the adapter; format at render with a `utils/` formatter.

## Metafields — the contract

Query them explicitly by identifier (Storefront does not return them by default):

```graphql
metafields(identifiers: [
  { namespace: "custom", key: "badge" }
  { namespace: "custom", key: "material" }
  { namespace: "custom", key: "promotion_text" }
  { namespace: "custom", key: "is_winter_collection" }
  { namespace: "custom", key: "care_instructions" }
]) { key value type }
```

Rules:

1. **The returned array is positional and contains `null`** for every identifier the product does not define. The adapter must tolerate `null` entries — indexing blindly is a crash, not a missing value.
2. **The adapter owns all parsing.** `value` is always a string: `boolean` → `value === 'true'`, `json` → `JSON.parse` inside a try/catch, `number_integer` → `Number(...)`. A parse failure yields `undefined`, never a throw that kills the screen.
3. **Absent means absent** — the adapter emits `undefined` for a missing metafield and the component returns `null`. No `''`, no `'—'`, no `'undefined'`, no default text. This is quick-rule #5 and it is the POC's grading criterion.
4. **Identifiers are declared once**, in `src/config/merchant/merchantConfig.ts` (`features` + metafield keys), so a new merchant with different keys is a config change.
5. The metafield must be **published to the Storefront API** in the Shopify admin (Settings → Custom data → the definition → "Storefront access"). A correct query against an unpublished definition returns `null` — check this before debugging the app.

Domain model shape (`productTypes.ts`):

```ts
type ProductMetafields = {
  badge?: string;
  material?: string;
  promotionText?: string;
  isWinterCollection?: boolean;
  careInstructions?: { washing?: string; drying?: string };
};
```

## Generic components, never merchant-named

The whole point of Case 4. A merchant requirement becomes a **generic component + a config flag**, never a named component:

```tsx
// ✅ reusable for every merchant
<ProductBadge text={product.metafields.badge} />
<ProductBadge text={features.winterCollection && product.metafields.isWinterCollection ? 'WINTER COLLECTION' : undefined} />
<ProductMetadata material={...} promotion={...} />
<ProductSection title="HOW TO CARE" items={careItems} />

// ❌ forbidden
<NorthstarWinterBadge />
```

`ProductBadge` returns `null` on a falsy `text`. That single behavior is what makes every "if the info doesn't exist, don't show the section" requirement a one-liner.

## Multi-merchant strategy (50 merchants, one app)

Three layers of variation, in order of preference:

1. **Credentials** — store domain + Storefront token per merchant (`merchantConfig`).
2. **Feature flags** — `features: { winterCollection, productCare, brandStory }`. A screen renders a section only when the flag is on **and** the data exists.
3. **Theme tokens** — `theme.primaryColor` and friends override the base Restyle theme. See `design.md`.

Anything that cannot be expressed in those three is a platform feature, not a merchant feature: build it generically and flag it off for everyone else. **A merchant name appearing anywhere outside `config/merchant/` is a defect.**

## Out of scope by decision (README "O que NÃO fazer")

Checkout, payments, auth/OAuth, orders, push, analytics, own backend, admin UI, E2E, CI/CD, store publishing. Do not scaffold them; do not add a placeholder for them.
