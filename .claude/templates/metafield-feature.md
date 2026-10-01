# Template — merchant asks for a new metafield-driven feature

A Merchant Success message ("the client wants a badge for the Winter Collection", "products with `care_instructions` should show a How-to-care section") becomes **config + adapter + generic component**. It must not touch the client, the queries' structure, navigation or any screen's shape.

**Before writing code:** run steps 1-2 of `standards/issue-protocol.md` — confirm the metafield exists in the Shopify admin **and is published to the Storefront API**, and confirm the raw GraphQL response contains it. Most of these requests die there.

## The 5 edits, in order

### 1. Declare the metafield identifier (config)

`src/config/merchant/merchantConfig.ts`

```ts
export const merchantConfig: MerchantConfig = {
  name: 'Northstar',
  storeDomain: Config.SHOPIFY_STORE_DOMAIN,
  storefrontToken: Config.SHOPIFY_STOREFRONT_TOKEN,
  theme: { primaryColor: '#E8FF4A' },
  features: {
    winterCollection: true,
    productCare: true,        // ← the new flag
    brandStory: false,
  },
};
```

A flag is added only when the section should be switchable per merchant. A field every merchant gets (like `material`) needs no flag.

### 2. Add the identifier to the fragment (one place)

`src/api/shopify/fragments.ts` — never in a screen, never in a second query.

```ts
export const PRODUCT_METAFIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductMetafields on Product {
    metafields(identifiers: [
      { namespace: "custom", key: "badge" }
      { namespace: "custom", key: "material" }
      { namespace: "custom", key: "promotion_text" }
      { namespace: "custom", key: "is_winter_collection" }
      { namespace: "custom", key: "care_instructions" }   # ← the new one
    ]) { key value type }
  }
`;
```

### 3. Extend the domain type

`src/domain/Product/productTypes.ts` — optional, camelCase, normalized:

```ts
export type ProductMetafields = {
  badge?: string;
  material?: string;
  promotionText?: string;
  isWinterCollection?: boolean;
  careInstructions?: { washing?: string; drying?: string };   // ← the new one
};
```

### 4. Map it in the adapter (the only parsing site)

`src/domain/Product/productAdapter.ts`

```ts
export const productAdapter = {
  toProduct,
  toMetafields,
};

function toMetafields(raw: (MetafieldApi | null)[] | undefined): ProductMetafields {
  const byKey = indexByKey(raw);

  return {
    badge: text(byKey.badge),
    material: text(byKey.material),
    promotionText: text(byKey.promotion_text),
    isWinterCollection: bool(byKey.is_winter_collection),
    careInstructions: json<CareInstructions>(byKey.care_instructions),
  };
}
```

Rules that make this safe:

- `raw` may be `undefined` and may contain `null` holes — `indexByKey` skips them.
- `text` returns `undefined` for an empty string, so `''` never renders as a section.
- `bool` is `value === 'true'`; anything else is `undefined`, not `false` (absent ≠ false when the UI branches on presence).
- `json` wraps `JSON.parse` in try/catch and returns `undefined` on failure. A malformed merchant value must not crash the screen.
- The helpers (`indexByKey`, `text`, `bool`, `json`) live **below** the main export in the same file, or in `domain/Product/utils/` once a second domain needs them.

### 5. Render with a generic component

Reuse first. Only create a component when no existing one fits, and name it for the **shape**, never the merchant or the metafield.

```tsx
// A badge. Nothing new is built: the existing primitive takes the text.
<ProductBadge
  text={features.winterCollection && product.metafields.isWinterCollection
    ? 'WINTER COLLECTION'
    : undefined}
/>

// A titled list of label/value pairs. Generic on purpose.
<ProductSection title="HOW TO CARE" items={careItems} />
```

`ProductSection` (and every component of this family) starts with the absence check:

```tsx
export function ProductSection({ title, items }: ProductSectionProps) {
  const visible = items.filter(item => Boolean(item.value));

  if (visible.length === 0) {
    return null;
  }

  return (
    <Box borderTopWidth={1} borderTopColor="border" paddingVertical="s16">
      <Text variant="titleMedium" color="text">{title}</Text>
      {visible.map(item => (
        <Box key={item.label} marginTop="s8">
          <Text variant="caption" color="textMuted">{item.label}</Text>
          <Text variant="body" color="text">{item.value}</Text>
        </Box>
      ))}
    </Box>
  );
}
```

The screen passes data and never wraps the component in a conditional — the component owns its own absence.

## Done when

- [ ] The metafield is published to the Storefront API in the admin.
- [ ] One product has it, one product does **not** — both verified on a running simulator.
- [ ] The product without it shows **no trace**: no heading, no divider, no empty space, no `undefined`.
- [ ] No merchant name was added outside `src/config/merchant/`.
- [ ] No screen, no navigation file and no `client.ts` was touched.
- [ ] Turning the feature flag off hides the section for every product.

## The 5-minute test

"The client wants the same feature for another 10 merchants." If the answer is anything other than *"add the identifier to the fragment and flip the flag per merchant"*, the feature was built in the wrong layer — go back to step 4 or 5.
