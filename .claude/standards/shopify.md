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
- `fragments.ts` renders the metafield selection from `productMetafieldBlocks`. A merchant with no metafield-backed block selects `id` instead — Shopify rejects `identifiers: []` (1..250 required) and a fragment with no selection is invalid.
- Errors: Storefront returns HTTP 200 with a top-level `errors` array. The client **must** inspect `errors` and throw — a 200 is not success.

## Query conventions

- Documents live in `src/domain/{Domain}/{domain}Queries.ts`, never inline in a service, hook or screen.
- Shared selections become fragments in `src/api/shopify/fragments.ts` (product card fields, metafield identifiers). Every new screen reuses a fragment instead of restating fields.
- Pagination is `first: N` + `edges { node { ... } }`. The **adapter** flattens edges/nodes — nothing above the adapter knows the word `edges`.
- Money is `MoneyV2 { amount currencyCode }`. Never format inside the adapter; format at render with a `utils/` formatter.

## Metafields — the contract

Query them explicitly by identifier (Storefront does not return them by default). The identifier
list is **rendered from the active merchant's declared areas**, never hardcoded:

```graphql
metafields(identifiers: [
  { namespace: "custom", key: "badge" }
  { namespace: "custom", key: "material" }
  # … one per metafield-backed block the merchant declared
]) { namespace key value type }
```

Rules:

1. **The returned array is positional and contains `null`** for every identifier the product does not define. The adapter must tolerate `null` entries — indexing blindly is a crash, not a missing value.
2. **The adapter owns all parsing.** `value` is always a string: `boolean` → `value === 'true'`, `json` → `JSON.parse` inside a try/catch, `number_integer` → `Number(...)`. A parse failure yields `undefined`, never a throw that kills the screen. A JSON payload that parses to something other than an object is also absent — merchant JSON is untrusted input, not a typed shape.
3. **Absent means absent** — a block whose source the product does not define produces no resolved block, and an area that collected nothing is omitted from `content` entirely. No `''`, no `'—'`, no `'undefined'`, no default text, and no empty array that renders an empty container. This is quick-rule #5, now held in the adapter as well as in each component.
4. **Sources are declared once**, as blocks under `screens.{screen}.{area}` in `src/config/merchant/merchants/{merchant}.ts`. The query is rendered from them and the adapter resolves through them, so a merchant with different keys — or a different set of concepts altogether — is a config change. See **Content blocks** below.
5. The metafield must be **published to the Storefront API** in the Shopify admin (Settings → Custom data → the definition → "Storefront access"). A correct query against an unpublished definition returns `null` — check this before debugging the app.
6. **Index by `namespace:key`, never by `key` alone.** `custom.badge` and `promo.badge` are two different metafields; once merchants declare their own sources, indexing by `key` silently merges them. That is why the selection includes `namespace`.

Domain model shape (`productTypes.ts`) — resolved blocks grouped by area, not a concept record:

```ts
type ProductContent = Partial<Record<ProductDetailArea, ResolvedBlock[]>>;

type ResolvedBlock =
  | { id: string; kind: 'badge'; text: string }
  | { id: string; kind: 'textLine'; text: string }
  | { id: string; kind: 'labelValueSection'; title: string; items: { label: string; value: string }[] };
```

## Generic components, never merchant-named

A merchant requirement becomes a **generic component + a config flag**, never a named component:

```tsx
// ✅ the screen renders areas; it never names a concept
<ContentBlocks blocks={content.badgeRow} direction="row" gap="s8" />
<ContentBlocks blocks={content.belowDescription} />

// ✅ the primitives, driven only by their shape
<ProductBadge text={...} />
<ProductSection title={...} items={...} />
<StoryCard title={...} body={...} image={...} />

// ❌ forbidden
<NorthstarWinterBadge />
<ProductBadge text={features.winterCollection ? 'WINTER COLLECTION' : undefined} />
```

Every component of this family returns `null` on a falsy value, and `ContentBlocks` returns `null`
for an empty area. That single behavior is what makes every "if the info doesn't exist, don't show
the section" requirement structural instead of a conditional in the screen.

## Multi-merchant strategy (50 merchants, one app)

**The app owns the grammar; the merchant owns the words.** A merchant fills a map of **screens**
and, inside each, the **areas** that screen draws — nothing else varies in code:

```ts
screens: {
  productDetail: {
    layout: { media: "gallery" },                   // how this screen draws, first
    badgeRow: [ /* badges, in render order */ ],
    underPrice: [ /* text lines */ ],
    aboveDescription: [ /* label/value sections */ ],
    belowDescription: [ /* text lines and label/value sections */ ],
  },
  home: {
    layout: { productRow: "double", collections: "horizontal" },
    productRow: "Products",                         // the row's heading, a plain string
    footer: { /* one story */ },
  },
}
```

**`layout` is the screen's first key and the only one that is not an area.** A screen says how it
draws before it says what it draws, each screen resolves its own (`homeLayout`,
`productDetailLayout`), and a screen the app grows later brings its arrangement with it instead of
extending a central map. `declaredAreas` drops the key so nothing below it has to know.

The key path is the position (so no block carries a `slot`), the array index is the render order
(so no block carries an `order`), and the element type is what that area accepts. A key left out is
an area that renders nothing — that is the whole optional/required mechanism.

**"Area", not "section".** `labelValueSection` is a block *kind* and `ProductSection` is the
component that draws it; a section is something you put *in* an area. Naming both the same thing is
how `content.detailBelowDescription` stopped saying which screen it belonged to.

| Owned by the app (source, closed) | Owned by the merchant (config, open) |
|---|---|
| the block `kind`s — `badge`, `textLine`, `labelValueSection`, `story` | which blocks exist |
| the areas themselves — which exist, on which screen, drawn where | which areas it fills, what goes in each, and in what order |
| parsing per `as` — `text`, `boolean`, `json` | where the data lives (`namespace`/`key`, or metaobject `type` + field map) |
| the primitives that draw each kind | every label and heading |

Plus two axes that are not blocks:

- **credentials** — store domain + Storefront token (and, on a development store, the storefront
  password), keyed per merchant in `.env`
- **theme** — a closed set of brand tokens, following the same split as the blocks: the app owns the
  alternatives, the merchant picks. See `design.md`.

**Layout is no longer a third axis.** It lives inside `screens`, as each screen's `layout` key, so
the screens map is the whole of a merchant's say over an interface: how each screen draws, then what
it draws.

Consequences worth stating:

- **A new concept is one array entry.** A merchant with `fit_guide` costs no type, adapter, screen or
  query edit. If a change needs one of those, the *kind* is missing — and a new kind is a platform
  change, not a merchant one.
- **A capability a merchant did not buy is an absent block**, not a `false` flag. There are no
  feature flags: a flag and a block were the same statement made twice.
- **Each area's element type is closed**, so a merchant cannot express an arrangement the renderer
  cannot draw: `badgeRow` takes badges, `underPrice` takes text lines, `home.footer` takes exactly
  one story. That is the containment for letting config decide content.
- **Cross-area order is the app's.** The detail areas are defined against fixed content (under the
  price, above/below the description), so the screen places them; the merchant orders what is
  *inside* an area.
- **A merchant name appearing anywhere outside `config/merchant/` is a defect.** So is a concept
  name — `winterCollection` was one merchant's campaign with an API name.

## Out of scope by decision (README "Out of scope")

Auth/OAuth, orders and the Customer API, push, analytics, own backend, admin UI, E2E, CI/CD, store publishing. Do not scaffold them; do not add a placeholder for them.

**Cart and checkout left this list on 2026-10-06** (PRD 015). The cart is Shopify's own, through the Cart API: `cartCreate` / `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove`, with every total read from `cost`, never summed on the device. Checkout is `cart.checkoutUrl` in a WebView — the app renders Shopify's page and reads back only whether it finished. Reimplementing contact, shipping or payment is still out: a POC does not hold card data.
