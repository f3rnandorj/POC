# Template — merchant asks for a new metafield-driven feature

A Merchant Success message ("the client wants a badge for the Winter Collection", "products with
`care_instructions` should show a How-to-care section") becomes **one entry in that merchant's
`screens` map**. Since PRD 012 there is nothing else to edit: no type, no adapter, no query, no
screen, no component, no flag.

This file is short on purpose. What survives is the part that was never one of the edits — the
pre-flight, which is where most of these requests actually die.

## 1. Pre-flight — do this before touching the repo

Run steps 1-2 of `standards/issue-protocol.md`:

- [ ] The metafield **exists** in the Shopify admin (Settings → Custom data).
- [ ] It is **published to the Storefront API** — the definition → "Storefront access". A correct
      query against an unpublished definition returns `null`, and you will spend an hour debugging
      the app for a checkbox in the admin.
- [ ] The **raw GraphQL response contains it.** Confirm against the API, not against the app.
- [ ] You know its **type** (`single_line_text_field`, `boolean`, `json`, …) and, for `json`, the
      **keys the merchant actually filled**.

For a `story` block the same list reads against a **metaobject definition**: it exists, it is
published to the Storefront API, the token carries `unauthenticated_read_metaobjects`, and you know
the field keys the merchant actually filled — plus how many entries the store holds, since each one
draws a section.

**Most of these requests die here.** A request that fails this list is not a code task.

## 2. Add the block

`src/config/merchant/merchants/{merchant}.ts` — append to the array at
`screens.{screen}.metafields.{area}` (or `.metaobjects.{area}` for a story). The key path is the
position, the array index is the order:

```ts
screens: {
  productDetail: {                       // the screen
    layout: { media: "gallery" },        // how it draws — the screen's first key, never an area
    metafields: {                        // the group: positions fed by the product's metafields
      belowDescription: [                // the area; only the kinds it accepts type-check
        {
          id: 'care',                    // stable, unique in the screen: it is the resolution key
          kind: 'labelValueSection',     // badge | textLine | labelValueSection | story
          label: 'How to care',          // the heading — merchant copy, never a screen constant
          source: {
            from: 'metafield', namespace: 'custom', key: 'care_instructions', as: 'json',
          },
          fields: [                      // which JSON keys become rows, and their labels
            { key: 'washing', label: 'Washing' },
            { key: 'drying', label: 'Drying' },
          ],
        },
      ],
    },
  },
}
```

The areas, top to bottom: `productDetail.metafields.badgeRow` → `textLines` → `aboveDescription` →
*(description)* → `belowDescription` → `metaobjects.footer`; on the home screen,
`metaobjects.header` (above the main product row) then `metaobjects.footer` (under the
collections). A `story` goes in a `metaobjects` position only — and its type is declared once in
the merchant's `metaobjectSources`, which the block names with `ref`.

No `slot` and no `order`: the key path says where it lands, the array index says when. An area the
merchant does not fill is simply absent — there is no empty array to declare and nothing renders in
its place.

Pick the kind by **shape, not by meaning**:

| The merchant wants | kind | source `as` | notes |
|---|---|---|---|
| a short pill of text | `badge` | `text` | renders the value |
| a pill that appears on a condition | `badge` | `boolean` | renders `label` when `true`; `label` is required |
| a line of prose under the price | `textLine` | `text` | no label prefix — values read as sentences |
| a titled list of label/value rows | `labelValueSection` | `json` | `fields` declares the rows |
| a block of prose with an image | `story` | — | `source: { from: 'metaobject', ref }` into `metaobjectSources`; **every entry of that type draws one section** — `first` caps the page |

**If no kind fits, stop.** A new kind is a platform change: it needs a `kind` in `merchantTypes.ts`,
an area that accepts it, a branch in `ContentBlocks` and a primitive to draw it — and it ships for every merchant, flagged on
by nobody until they declare it. That is a different task with a different review.

## Done when

- [ ] The metafield — or the metaobject definition — is published to the Storefront API in the admin.
- [ ] One product has it, one product does **not** — both verified on the running simulator.
- [ ] The product without it shows **no trace**: no heading, no divider, no empty space, no
      `undefined`, and no gap where the block would have been.
- [ ] `git diff --stat` touches **one file**, under `src/config/merchant/merchants/`.
- [ ] No merchant name and no concept name was added outside `src/config/merchant/`.

## The 5-minute test

"The client wants the same feature for another 10 merchants." The answer is *"add the block to each
merchant's area"*. If it is anything else, the feature was built in the wrong layer — the block
model exists so that this question has one answer.
