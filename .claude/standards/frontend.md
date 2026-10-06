# Frontend — React Native CLI patterns

## Screens

Thin. A screen composes components and calls one or two useCase hooks. It never maps data, never formats money, never touches a Shopify type.

Every list/detail screen handles the four states explicitly: **loading · error · empty · content**. All four use the project identity (see `design.md`), never a library default.

## UseCase hooks (the only React Query entry point)

```ts
export function useProductList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductList],
    queryFn: () => productService.list(),
  });

  return { products: data ?? [], isLoading, error, refetch };
}
```

- Query keys come from the `QueryKeys` enum in `src/infra/infraTypes.ts` — never an inline string.
- The hook returns a UI-ready shape (`products`, `isLoading`), not the raw React Query object.
- A hook never calls `productApi` directly.

## The `Screen` container

Every screen is a `Screen`. It owns the safe area, the background, the gutter, the title row, the
back control — and two slots worth knowing:

- `footer` — a CTA pinned over the scroller. Its height is **measured with `onLayout`** and added to
  the scroller's `paddingBottom`, never assumed: the safe area, the font scale and the label all
  move it.
- the cart control — drawn by `Screen` itself, in the title row or floating opposite the back
  control on a screen that opens on a photo. `cartAction={false}` turns it off for the screens that
  are the cart or past it. A new screen gets it by existing.

## Components

- Presentational and Restyle-themed. Props in, JSX out.
- A component that renders optional merchant data **returns `null` when the value is absent** — the caller does not wrap it in a conditional. This keeps the "don't show the section" rule in exactly one place per component.
- Shared across flows → `src/components/{Name}/`. Used by one screen only → `src/screens/{Screen}/components/`.
- Props interfaces are local to the component file and named `{Name}Props`.

## Restyle

- `Box`, `Text`, `TouchableOpacityBox` created from `createBox`/`createText`/`createTouchableOpacity` against `src/theme/theme.ts`.
- Theme-typed props only: `backgroundColor="surface"`, `padding="s12"`, `borderRadius="s4"`, `variant="titleLarge"`.
- `useAppTheme()` wraps `useTheme<Theme>()` for imperative access (an icon color, a computed alpha).
- `style={{}}` is allowed **only** for computed values (`hexToRgba(theme.colors.accent, 0.1)`) or non-theme numbers. Everything else is a prop.
- No `StyleSheet.create`, no inline hex, no magic numbers.

## Navigation

- React Navigation, one native stack: `Home → ProductList → ProductDetail` for browsing, and `Cart → Checkout → CheckoutResult` for buying.
- **A round trip never grows the stack.** Cart ↔ detail uses `popTo`, which returns to the existing route (swapping its params) and, when the route is absent, replaces the current one instead of pushing. `push` is never the answer for a screen the user can bounce back to.
- A finished checkout is not a screen to return into: `CheckoutResult` disables the back gesture and leads forward, to Home.
- Params are typed in `src/routes/types/navigationTypes.ts` (`AppStackParamList`). A screen reads them via the typed `useRoute`/props, never `any`.
- Pass **ids**, not objects, between screens — the detail screen fetches its own data through its useCase hook so React Query owns the cache.

## Lists

- `FlatList` with `keyExtractor` on the product id. No `ScrollView` for product collections.
- Images: `resizeMode` explicit, a fixed aspect ratio box, and a placeholder background from the theme so the grid doesn't jump while loading.

## Verification

There is no test suite (quick-rule #11). A change is done when it was exercised in the simulator/emulator with real Storefront data: `yarn ios` / `yarn android`. State that cannot arrive on its own (a metafield the store doesn't define) is verified by adding the metafield in the Shopify admin, not by faking the domain model in code.
