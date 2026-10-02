# Fuego — Shopify Storefront POC

A React Native app that renders a live Shopify store, where the parts of a product that are
specific to one merchant — a badge, a fabric, a promotion line, a care guide — are **not** in the
app. They live in Shopify as metafields, the merchant edits them, and the app shows whatever is
there. Nothing is deployed when a merchant changes their mind.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native_0.87-20232A?logo=react&logoColor=61DAFB)
![React Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?logo=reactquery&logoColor=white)
![Restyle](https://img.shields.io/badge/Restyle-7AB55C?logo=shopify&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)

| Home | All products | Product detail |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Product list](docs/screenshots/product-list.png) | ![Product detail](docs/screenshots/product-detail.png) |

The same screen, for a product whose merchant filled nothing in, next to one where variants and
the care guide exist:

| Nothing to show | Variants + care guide |
|---|---|
| ![Product with no metafields](docs/screenshots/product-detail-absent.png) | ![Variants and care section](docs/screenshots/product-variants.png) |

No placeholders, no `Material: —`, no empty heading. The sections are simply not there.

There is no hosted build. You run it from source on a simulator, or you build the APK yourself —
both are described below.

---

## Technologies

Everything here is in `package.json`; nothing is listed that the project does not use.

| | Why it is here |
|---|---|
| **React Native 0.87 (CLI)** | Bare CLI, not Expo. Nothing in the project needs the managed workflow, and the CLI keeps the native projects open for the Shopify SDKs a real deployment would reach for. |
| **TypeScript** | The Storefront payload and the domain model are separate types on purpose; the compiler is what keeps a raw Shopify shape from leaking into a screen. |
| **React Navigation** (native stack) | Three screens, one stack. Params are typed in `src/routes/types/navigationTypes.ts`. |
| **TanStack Query v5** | Owns every bit of server state: cache, retry, loading and error flags. There is no second state library, and no Redux. |
| **@shopify/restyle** | Themed primitives (`Box`, `Text`) whose props only accept tokens from `src/theme`. A raw hex in a component does not compile. |
| **react-native-config** | Reads the store domain, Storefront token and API version from `.env`, so no credential is ever in a tracked file. |
| **Shopify Storefront API + GraphQL** | Buyer-facing and read-only, so its token is safe on a device. One query shapes a whole screen. Called with the platform's own `fetch` — no HTTP client was added for four requests. |

**There is no test layer, and that is deliberate.** Installing Jest and RTL to assert that an
adapter maps five fields would have cost more than the mapping; the thing actually worth checking
here is whether a real Shopify response renders, which a unit test cannot tell you. Verification
is the simulator against the live store. For anything beyond a POC this is the first gap to close.

**Lint is the gate.** ESLint carries the logic rules and runs Prettier as a rule, so `yarn lint`
is the single thing that has to pass and `yarn lint --fix` is the only thing that reformats.

---

## Requirements

| | |
|---|---|
| Node | `>= 22.11.0` |
| Yarn | 1.x |
| Xcode | 16+, with an iOS simulator installed |
| Ruby + Bundler | for CocoaPods (`Gemfile` is committed) |
| Android Studio | only if you want the Android build |

You also need a Shopify store you can administer — see [Shopify setup](#shopify-setup).

---

## How to run

```bash
git clone <this-repo>
cd POC
yarn
yarn pods           # bundle exec pod install, iOS only
cp .env.example .env   # then fill it in — see below
yarn ios            # or: yarn android
```

`.env` holds three keys and no defaults:

```sh
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=   # public Storefront access token
SHOPIFY_API_VERSION=2026-01 # pinned; an unpinned endpoint changes shape under you
```

The app throws on startup if any of the three is missing, rather than failing later with an
unhelpful network error.

> `react-native-config` reads `.env` at **build** time. Change it and you have to rebuild —
> reloading the bundle is not enough.

### Shopify setup

1. **Headless channel** — install it on the store, create a storefront, and copy the **public
   access token**. This is not an Admin API token; an Admin token must never reach the device.
2. **Scopes** — the public token needs `unauthenticated_read_product_listings` (this covers
   collections too) and `unauthenticated_read_metaobjects` for the brand story block.
3. **Metafield definitions** — under *Settings → Custom data → Products*:

   | Namespace / key | Type |
   |---|---|
   | `custom.badge` | single line text |
   | `custom.material` | single line text |
   | `custom.promotion_text` | single line text |
   | `custom.is_winter_collection` | boolean |
   | `custom.care_instructions` | JSON (`{"washing": "...", "drying": "..."}`) |

4. **⚠️ Turn on Storefront access for every definition.** Each definition has a *Storefront
   access* toggle, and it is **off** by default. A definition that is correct in every other way
   but not exposed returns `null` to a correct query, so the app renders nothing and looks like
   it is ignoring your data. This is the single most common reason the app looks "empty" —
   check it before debugging anything in the code.
5. **Metaobject** — a `brand_story` metaobject with `title`, `description` and `image` fields,
   also exposed to the Storefront API. It feeds the block at the bottom of the home screen.
6. **Publish** your products to the headless storefront's publication, or they will not be
   returned at all.

There is a seeding script for a throwaway dev store (`scripts/seed-catalog.mjs`). It uses the
**Admin** API, is dev-only tooling that nothing under `src/` imports, reads its token from the
environment, and only ever creates or updates — it never deletes.

### Building the APK

```bash
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

Honest caveat: everything in this project was exercised on the iOS simulator. The Android side is
the stock React Native scaffold, untouched and unverified.

---

## Project structure

```
src/
├── api/shopify/        the transport, and the only place that knows Shopify exists
│   ├── client.ts         fetch + Storefront headers + pinned API version
│   ├── fragments.ts      shared GraphQL selections, built from the merchant's config
│   └── shopifyTypes.ts   raw payload shapes (MoneyV2, edges/nodes, metafields)
├── domain/             one folder per concept: Product, Collection, BrandStory
│   └── Product/
│       ├── productQueries.ts   the GraphQL documents
│       ├── productApi.ts       runs a document, returns the raw payload
│       ├── productService.ts   delegates
│       ├── productAdapter.ts   payload → domain model; owns ALL parsing
│       ├── productTypes.ts     Product, ProductVariant, ProductMetafields
│       ├── useCases/           use{Domain}{Action}{Target} — the React Query entry point
│       └── index.ts            exports useCases + types, never the service
├── config/merchant/    per-merchant credentials, flags, metafield map, theme, labels
├── components/         generic and presentational: ProductBadge, ProductSection, ...
├── screens/            Home, ProductList, ProductDetail (+ screen-local components)
├── routes/             one native stack, typed params
├── theme/              Restyle theme: palette, tokens, text variants, fonts
├── infra/              query client, QueryKeys enum
└── utils/              pure helpers (price formatting, …)
```

Data flows one way:

```
Shopify Storefront API
  → client.ts            headers, API version, throws on the `errors` array (a 200 is not success)
  → {domain}Queries.ts   the GraphQL document
  → {domain}Api.ts       raw payload, untransformed
  → {domain}Adapter.ts   → domain model. Every bit of parsing happens here and nowhere else
  → useCase hook         React Query: cache, loading, error
  → screen               renders a domain model, and has never heard of Shopify
```

What each layer may not do:

| Layer | Must not |
|---|---|
| Screen / component | Contain business logic, call a service, or touch a Storefront-shaped type |
| UseCase hook | Reach past the service into the api |
| Service | Know that React exists |
| Api | Transform anything |
| Adapter | Make a network call |

The boundary is structural, not a convention: `domain/{Domain}/index.ts` exports **use cases and
types only**. The service is not reachable from `@domain`, so a screen calling it directly does
not compile.

**Where new things go.** A screen → `src/screens/{Name}Screen/`. A component shared across flows
→ `src/components/{Name}/`; used by one screen → that screen's `components/`. A new metafield →
three edits, none of them in a screen: a key in `merchantConfig.metafields`, a field in
`ProductMetafields`, a line in the adapter.

---

## Key features

**Product browsing.** Home with featured products and collections, a product grid for the whole
catalogue or one collection, and a detail screen with images, price, description, variants and
availability. Sold-out variants are visible but not selectable, and picking a variant that has
its own photo swaps the image.

**Merchant content through metafields.** Metafields are not returned by default, so they are
requested explicitly by identifier. Shopify answers with a **positional array containing `null`
for every identifier the product does not define** — so the adapter builds a key→value map and
reads by key, because indexing that array by position crashes on the first bare product. From
there: the adapter emits `undefined`, and the component returns `null`. A missing value renders
nothing at all, and the rule lives in one place per component instead of in every caller.

**Generic components, always.** A merchant requirement becomes a generic component plus a config
entry — `<ProductBadge text={...} />` and `<ProductSection title={...} items={...} />`, never a
`<NorthstarWinterBadge />`. Merchant identity exists only inside `src/config/merchant/`. The
"Winter Collection" badge is just `ProductBadge` fed by a flag and a boolean metafield; the care
guide is `ProductSection`, which would render "Ingredients" for a cosmetics merchant with no code
change.

**One app, many merchants.** Variation is allowed in exactly three layers:

1. **Credentials** — store domain and Storefront token.
2. **Feature flags** — `winterCollection`, `productCare`, `brandStory`. A section renders when
   the flag is on *and* the data exists.
3. **Theme tokens + labels** — an accent colour and the user-facing section titles.

Metafield keys are part of that config, as a map from *concept* to *Shopify identifier*. A
merchant who calls the fabric `fabric_type` instead of `material` costs one line, because both
the query and the adapter are built from the map. A second merchant (`atlas`) is committed to
prove it: different accent, `winterCollection` off, `material` pointed at a key the catalogue does
not define — and that line simply disappears. Switching merchants is one constant in
`merchantConfig.ts`.

Anything that cannot be expressed in those three layers is a platform feature, not a merchant
feature: it gets built generically and flagged off for everyone else.

**Theming.** Every colour, space and radius is a token from `src/theme`. There is no raw hex
anywhere in the app; a merchant's brand colour lives in their config, and the readable text
colour on top of it is derived from its luminance rather than configured twice.

---

## How to use

1. **Home** — featured products, the collections, and the brand story block at the bottom,
   which comes from a Shopify metaobject rather than a metafield.
2. Tap **All products**, or a collection, to reach the grid. Same screen in both cases; the
   collection just scopes it.
3. Tap **Northstar Essential**. This is the fully-populated case: `BEST SELLER` and
   `WINTER COLLECTION` badges, `Organic Cotton`, the promotion line, a `HOW TO CARE` section from
   a JSON metafield, and three variants.
4. Tap **Black**, then **White** — the product image follows the selected variant. **Blue** is
   sold out: visible, marked, not selectable.
5. Go back and open **Everyday Tee**. Same screen, same code, and the merchant filled in nothing:
   no badges, no material line, no care section, no variant picker. Not a dash, not an empty
   heading — the sections do not exist. That is the whole point of the metafield contract.

---

## Out of scope

Deliberately absent, each for a reason — not a roadmap:

| | Why |
|---|---|
| Cart and checkout | Shopify's own checkout is the answer, via the Cart API and a web handoff. Reimplementing it proves nothing about merchant customisation. |
| Customer auth / OAuth app install | A real multi-merchant app installs through Shopify OAuth and keeps tokens server-side. Here, `getMerchantConfig` is a local stand-in for that platform endpoint — same shape, no server. |
| Orders and account | Needs the authenticated Customer API, which needs the auth above. |
| Own backend / admin UI | The merchant's admin **is** the Shopify admin. That is the entire argument for metafields. |
| Push, analytics, error monitoring | Pure infrastructure; it would not change a line of the architecture. |
| Automated tests, CI/CD | See the note in [Technologies](#technologies). The first thing to add, in that order. |
| App Store / Play Store release | Nothing is shipped from a POC. |

---

## Contact

**Fernando Henrique**
[f3rnandorj10@gmail.com](mailto:f3rnandorj10@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/fernando-h-fernandes/) ·
[GitHub](https://github.com/f3rnandorj10)
