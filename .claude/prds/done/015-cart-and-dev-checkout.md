# PRD: Cart and Dev Checkout

**Status:** done
**Started:** 2026-10-06
**Shipped:** 2026-10-06
**Source:** user request 2026-10-06 — "checkout in dev mode: cart, checkout, and a feedback screen"

> This block **reverses a documented exclusion**. The README's "Out of scope" table says cart and
> checkout prove nothing about merchant customisation. The user asked for them anyway, in dev mode,
> so the exclusion becomes an ADR and the README row goes with it. Nothing else in that table moves.

## Overview

The POC can browse a merchant's catalogue but cannot buy from it. This block adds the buying half:
a cart backed by Shopify's own Cart API, the **real Shopify checkout** opened in a WebView, paid
with a test payment gateway, and an in-app feedback screen that owns the outcome.

Nothing here is simulated. The cart lives in the merchant's store, the totals are Shopify's, and a
completed checkout produces a real order in the admin flagged as a test. What makes it "dev mode" is
the payment gateway, not a fake flow.

## Goals

- A buyer can add a variant, review the cart, check out and see a result, without leaving the app
- Nobody handed the demo can mistake the checkout for a real purchase, or wonder what to type into the card field
- Totals, currency and stock come from Shopify — never summed on the device
- The cart survives an app restart and dies with a merchant switch
- The checkout handoff works on a password-protected development store, with no step the buyer has to understand
- A merchant with no storefront password works through the same code path, untouched

## Standards Referenced

- `.claude/standards/security.md` — **amended by this block**: the "nothing is persisted" line and the WebView rule
- `.claude/standards/shopify.md` — **amended by this block**: checkout leaves the "out of scope by decision" list
- `.claude/standards/frontend.md` — useCase hooks, screen composition, the four states
- `.claude/standards/design.md` — the CTA, the cart row and the feedback screen are drawn in the identity
- `.claude/standards/quick-rules.md` — #2 (adapter), #3 (queries file), #5 (absent renders nothing), #10 (barrels), #11 (simulator is the gate), #17 (no V2)

## Decisions Referenced

- 2026-10-01 — React Query v5 refuses `undefined`: a "not found" crosses the cache as `null`
- 2026-10-03 — Runtime merchant switching: nothing derived from the merchant may be a module constant; the cache is cleared on switch
- 2026-10-03 — `Screen` is the container of every screen; `PressableBox` owns touch feedback
- 2026-09-30 — Metafield/credential rule: values live in `.env`, consumed only in `config/merchant/`

## Verification log

- 2026-10-06 — US-001 exercised against `northstar-poc` with the project's own documents: create 2 → 598.00 USD, update to 1 → 299.00, read, remove → 0.0; unknown cart id → `null`; invalid variant → `userErrors` with `cart: null`.
- 2026-10-06 — `npx tsc --noEmit` and `yarn lint` clean; iOS build with the three new native dependencies succeeded and the app launched on the one booted simulator (iPhone 17, iOS 27); Metro serves the bundle at HTTP 200 with the new modules resolved.
- 2026-10-06 — stock cap measured with the project's own document: tracked variant, 25 requested → cart holds 10 with `userErrors: []`, `stockLimit` 10, plus disabled; Boxy Tee (untracked) 17 requested → cart holds 17, no cap. Shopify enforces, the app displays.
- 2026-10-06 — the detail document, metafields and all, validated against the store with the inventory field: Northstar Essential caps White and Black at 10 and leaves sold-out Blue uncapped; Boxy Tee comes back untracked, so no cap.
- 2026-10-06 — headroom measured: cart at 10 of 10 + a request for 3 → `userErrors: []` and 0 added (CTA now disabled before that); cart at 8 + a request for 5 → 2 added, and the note says so.
- 2026-10-06 — the flow exercised end to end by the user on the one running simulator: add from the detail, stepper and removal in the cart, the dev-mode notice, Shopify's checkout with no password prompt, a paid test order and the feedback screen. Two defects came out of that pass and were fixed in it — the checkout's own `{"checkout_completed":true}` rendering as the order number, and the feedback screen missing its gutter.
- 2026-10-06 — screenshots for the README captured by temporary route, never by synthetic input, and reverted after (`grep TEMP-SCREENSHOT` is empty).
- **Android:** the release APK builds and is what ships in `dist/`; no screen was tuned for it, which the README already states.

## Quality Gates

- `npx tsc --noEmit` and `yarn lint` clean
- `bash .claude/scripts/check-security.sh` — this block touches `.env`, network and a WebView
- Exercised on the one running simulator (quick-rule #11), both merchants
- A **real test order** appears in the Shopify admin, marked as a test, with the quantity the app sent
- Cart survives killing and reopening the app; switching merchants empties it

## User Stories

> Next US = first in document order with all `Depends on` complete.

### US-001: The cart domain

**Depends on:** —
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `src/domain/Cart/` follows the API-Bound chain: `cartQueries.ts` → `cartApi` → `cartAdapter` → `cartService` → useCases
- [x] Documents: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove` and the `cart` query — all in `cartQueries.ts`, none inline
- [x] `Cart` carries `id`, `checkoutUrl`, `totalQuantity`, `subtotal: ProductPrice` and `lines: CartLine[]`; money stays unformatted, `formatPrice` runs at render
- [x] The adapter flattens `edges`/`node` — nothing above it knows the word `edges`
- [x] `QueryKeys.Cart` added to the enum; no inline key string
- [x] Mutations use the `MutationOptions<T>` contract already sitting in `infraTypes.ts`
- [x] A `userErrors` entry is surfaced as a typed error with a displayable message, never swallowed
- [x] The domain barrel exports useCases + types only, never `cartService`

### US-002: Cart identity that survives a restart

**Depends on:** US-001
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `react-native-mmkv` + its `react-native-nitro-modules` peer installed, pods rebuilt, both platforms booting
- [x] `activeCart.ts` mirrors `activeMerchant.ts`: mutable id + `useSyncExternalStore`, no module constant derived from the merchant
- [x] The stored key is **per merchant** — switching merchants never hands one store's cart id to another
- [x] On startup the stored id is re-fetched; a cart Shopify no longer knows returns `null` and the app **silently starts a new one** instead of opening on a dead screen
- [x] Switching merchants clears the active cart alongside the query cache
- [x] Only the cart id is persisted — no line data, no price, no password

### US-003: Add to cart

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] A shared `Button` component — the repo's first — drawn from the identity: `accent` fill, `accentText` label, `s2` radius, no shadow
- [x] The CTA sits fixed over the Product Detail scroller; the content reserves its height by measuring the footer with `onLayout`, never by a constant
- [x] The footer carries a quantity stepper and the CTA adds **that** quantity, not one
- [x] The ceiling is the variant's stock **minus what the cart already holds**, and the CTA disables at zero instead of claiming an add Shopify will not make
- [x] The confirmation reports what was actually added, read from the cart that came back — not what was requested
- [x] The stepper stops at the selected variant's tracked stock; picking another variant resets it to one, and a successful add resets it too
- [x] Adding uses the selected variant; with no selectable variant the CTA is disabled, not hidden
- [x] A sold-out variant cannot be added — the picker already refuses to select it
- [x] While the mutation is in flight the CTA shows its own pending state; a double tap cannot add twice
- [x] Success gives in-place feedback on the detail screen; it does **not** navigate away

### US-004: The cart screen

**Depends on:** US-002, US-003
**Complexity:** 6/10

**Acceptance Criteria:**
- [x] Route `Cart` in `AppStackParamList`, no params — the screen reads the active cart through its hook
- [x] Entry point in the Home header via `Screen headerRight`, showing the item count; **count zero renders no badge**
- [x] A line shows photo, product title, variant title, quantity and line total
- [x] The stepper stops at the variant's `quantityAvailable` when the merchant tracks it, and says so; an untracked variant (`quantityAvailable: 0` with `availableForSale: true`) has no cap
- [x] Quantity stepper calls `cartLinesUpdate`; the decrement at 1 and the remove control both call `cartLinesRemove`
- [x] Subtotal is Shopify's `cost.subtotalAmount` — never a sum computed on the device
- [x] The four states are drawn in the identity: loading, error with retry, **empty with a route back to the catalogue**, content
- [x] The checkout CTA is disabled while the cart is empty or a line mutation is in flight

### US-005: The dev-mode notice

**Depends on:** US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] Pressing the checkout CTA opens a dialog before anything navigates — the handoff never starts behind it
- [x] Built on React Native's own `Modal`, drawn in the project identity (no library default, no system alert)
- [x] The copy states that this is a development store, that the checkout is real and the payment is not, and that nothing is charged
- [x] It lists the test card values: `1` approves, `2` declines, `3` fails at the gateway, with any future expiry date and any 3-digit security code
- [x] Two actions: continue, which opens the checkout, and cancel, which returns to the cart with the cart untouched
- [x] The copy is **app copy, not merchant copy** — dev mode is a property of the build, so nothing here goes through `config/merchant/`
- [x] It appears on every checkout press, not once per session: the demo is handed to someone new each time
- [x] Dismissible by the system back gesture on Android, and the dialog is reachable and readable at the largest font scale

### US-006: The checkout handoff

**Depends on:** US-005
**Complexity:** 7/10

**Acceptance Criteria:**
- [x] `react-native-webview` installed; the checkout opens in a full screen route, not a modal over the cart
- [x] The WebView loads **only** the active merchant's `storeDomain` — host checked explicitly before any navigation is allowed, per `security.md`
- [x] When the merchant config carries a storefront password, the screen first **submits the password form** at `/password` inside the WebView, then loads the `checkoutUrl`; the buyer sees no password page
- [x] **An absent password key means no pre-auth step** — a store without password protection runs the same code path untouched
- [x] The password reaches the app from `.env` through `react-native-config`, like the token; it is never in a tracked file, never logged, and never rendered
- [x] If the store still answers with its password page, it renders as Shopify drew it — never a blank screen
- [x] Completion is detected by navigation to the order-status URL, and routes to the feedback screen
- [x] Back/cancel returns to the cart with the cart intact — an abandoned checkout is not a cleared cart
- [x] A WebView load failure shows the identity's error state with a retry, not a blank white screen

### US-007: The feedback screen

**Depends on:** US-006
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] Success shows the order reference Shopify returned, drawn in the identity — type and accent, no library default, no emoji
- [x] On success the active cart is cleared and a new one starts empty
- [x] The only way out is forward: a CTA back to Home, with no back gesture returning into a finished checkout
- [x] The screen never reconstructs what was bought from local state — what it shows came from the checkout

### US-008: The record

**Depends on:** US-007
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] The README's "Out of scope" row for cart and checkout is replaced by what was built and why it is dev mode
- [x] The same table's stale "Merchant switching at runtime" row is corrected — it shipped on 2026-10-03
- [x] `standards/shopify.md` drops checkout from "out of scope by decision"
- [x] `standards/security.md` records that exactly one non-sensitive id is persisted, and that the WebView rule is "the merchant's own checkout, host-checked" rather than "never"
- [x] `memory/decisions.md` + `decisions-index.md` carry this block's Resolved Decisions

## Added while the block was being built

Asked for during the build, after the user exercised it on the device. Each is shipped and recorded
as an ADR; they are listed here so the PRD matches what exists.

- **A quantity stepper on the product detail**, and the CTA adds that quantity. The stepper became
  `components/QuantityStepper`, shared with the cart line.
- **Stock ceilings, read from Shopify.** `quantityAvailable` reaches both the cart line and the
  product variant; a positive count is a cap, `0` means untracked. On the detail the ceiling is the
  stock **minus what the cart already holds**, and the confirmation reports what was actually added
  rather than what was asked — Shopify trims a line silently.
- **The cart control moved into `Screen`**, so every screen carries it without asking, and
  `cartAction={false}` turns it off for the cart and what is past it. Opening a product from a cart
  line uses `popTo`, so bouncing between the two cannot grow the stack.
- **WebView messages are untrusted input.** The checkout's own `{"checkout_completed":true}` was
  rendering as the order number; the bridge is now parsed, only this app's payload carries a
  reference, and the host allowlist is anchored (a bare `shop.app` suffix matched `evilshop.app`).

## Functional Requirements

- FR-1: The cart is server-side at Shopify; the device holds an id, never a line list.
- FR-2: Every price shown in the cart comes from the Cart API response.
- FR-3: The app never asks the buyer for the storefront password.
- FR-4: A test payment gateway is configured in the admin before the flow is exercised — no code path depends on which one.
- FR-5: Merchant switch = new cart, cleared cache, no cross-store leakage.
- FR-6: Nobody reaches Shopify's checkout without first being told, in the app, that the payment is a test and which card numbers to use.

## Non-Goals

- Real payment capture, real money, or a production payment gateway
- Customer accounts, saved addresses, order history — all need the authenticated Customer API
- `@shopify/checkout-sheet-kit` — evaluated and rejected: its sheet owns its cookie store, so the password pre-auth cannot be planted and the buyer would type the store password
- Discount codes, gift cards, shipping method selection in-app — Shopify's checkout owns all of it
- Persisting line data for offline cart reading

## Technical Considerations

**Measured 2026-10-06 against `northstar-poc`, before writing this PRD:**

| Probe | Result |
|---|---|
| `cartCreate` with the existing Storefront token, 2× a variant | `userErrors: []`, subtotal **598.00 USD** from Shopify |
| `GET` the returned `checkoutUrl` | `/cart/c/…` → 4× `/checkouts/cn/…` → root → **`/password`** |
| `?channel=headless-storefronts`, the community workaround | no effect — still `/password` |
| `GET /password?password=…`, then the `checkoutUrl` in the same cookie store | **HTTP 200, "Checkout - northstar-poc"** |
| Removing the password in the admin | impossible — "Modo privado" is already off and the store still gates; a development store needs a paid plan to lift it |
| **Control, same flow with a deliberately wrong password** | **also reached the checkout** — so the password was never what unlocked it |
| Seeding the session with `/`, `/password` or `/products.json`, then the `checkoutUrl` | checkout opens in all three |
| The `checkoutUrl` with no cookie at all | `/password` |
| `/cart/{variantId}:1` permalink **with** a session | `/password` — theme pages stay gated |

| **Real browser engine (Playwright), fresh profile, straight to the `checkoutUrl`** | `/password` |
| Same engine, password typed in the form once, then the `checkoutUrl` | **checkout renders** — Contact, Delivery, Payment with card fields, total 299 USD |

Two of those rows disagree, and the browser wins. In `curl` a session seeded by any earlier request
was enough, and a deliberately **wrong** password passed too — so that path proves nothing about the
password and does not reproduce in a real engine. In Chromium, a fresh profile goes to `/password`
and only the **submitted form** opens the checkout. The block therefore submits the password form
inside the WebView, which is exactly what the browser test did by hand.

The same test confirmed the test gateway: with the form submitted, the checkout offers a credit card
field for 299 USD — the gateway activated in the admin on 2026-10-06 is live.

**Shape notes**

- `Cart` and `CartLine` live in `cartTypes.ts`; `CartLine.lineTotal` is a `ProductPrice`, so the existing `formatPrice` serves it.
- The cart id is a capability token for that cart: whoever holds it can read and modify it. It is not a credential for the store, which is why MMKV is acceptable for it and would not be for the Storefront token.
- MMKV v4 requires `react-native-nitro-modules` as a peer — two native packages, one `pod install`, new architecture (already on, RN 0.87).
- The checkout screen is the first place in the app that renders remote HTML. `security.md`'s rule was "never render merchant HTML in a WebView", which this does not do: it renders Shopify's checkout, on a host the app verified.

## Success Metrics

- Add → cart → checkout → feedback completes on the simulator without a manual step outside the app
- The resulting order is visible in the Shopify admin, flagged as a test, matching the quantity sent
- Killing the app mid-flow and reopening restores the same cart
- Switching merchants leaves no trace of the other store's cart
- `yarn lint`, `npx tsc --noEmit` and `check-security.sh` clean

## Resolved Decisions (2026-10-06)

- **Cart is Shopify's, not local** — a device-side sum would have made every number in the cart a claim the store never verified.
- **WebView over the official Checkout Sheet Kit** — the sheet's isolated cookie store cannot carry the password pre-auth, and a demo that asks for a store password is a worse artifact than a non-native sheet.
- **Checkout leaves the "out of scope" list** — the exclusion was a scope decision, and the user reversed it.
- **Only the cart id is persisted** — it is not a store credential, and anything more would be a cache of data Shopify owns.
- **The dev-mode notice is a gate, not a footnote** — it stands between the CTA and the handoff, and it carries the test card values, because the person testing has no other place to find them.
- **The WebView submits the password form; it does not rely on a primed session** — a `curl` session passed with any password, including a wrong one, but a real browser engine did not reproduce it. A conclusion that only holds in `curl` is not a conclusion about a WebView.

## Open Questions

- None open. Both were resolved on 2026-10-06:
  - **Gateway: Bogus Gateway, in both stores.** Shopify Payments test mode is out — it needs a completed Shopify Payments setup on a paid plan, which a development store does not have.
  - **Atlas ships with the feature too.** Each merchant needs the test gateway active in its own admin and its own storefront password key in `.env`.
