# Merchant onboarding form

Fill this in and send it back. With these answers in hand, your store runs in the app without a
single new screen, component or query being written — the whole integration is one configuration
file plus your credentials.

**How to fill it in:** replace every `___` and tick one option where a list is offered. Leave a
field blank when it does not apply to you — a blank is a valid answer and means "we do not show
this", not "we forgot". Nothing you leave out produces an empty heading or a gap in the app.

**One thing to send separately:** the Storefront access token. It is a read-only public token, but
please send it over a channel you would use for a password rather than in this document.

---

## 1. Company and store

| Field | Your answer |
|---|---|
| Company / brand name | `___` |
| Short id for the brand (lowercase, no spaces — e.g. `atlas`) | `___` |
| Shopify store domain (`your-brand.myshopify.com`) | `___` |
| Contact for technical questions (name + email) | `___` |
| Storefront API access token | sent separately ☐ |

**How to create the token:** Shopify admin → Settings → Apps and sales channels → Develop apps →
create an app → Configuration → Storefront API → grant `unauthenticated_read_product_listings`
(plus `unauthenticated_read_metaobjects` if you answer section 5) → Install → copy the Storefront
access token.

Please do **not** send an Admin API token. The app never needs one, and an Admin token grants write
access that must not reach a phone.

---

## 2. Brand colours

Six colours define the whole app. Give us hex values; leave any line blank to keep our neutral
near-black base for it.

| Role | Where it shows | Your hex |
|---|---|---|
| Accent | buttons, badges, prices, active states | `___` |
| Background | the page behind everything | `___` |
| Surface | cards, tiles, the variant picker | `___` |
| Text | headings and body copy | `___` |
| Muted text | secondary lines, captions | `___` |
| Border | dividers and outlines | `___` |

Two notes, so there are no surprises later:

- **Text on button, "in stock" green and "sold out" red are calculated, not chosen.** They are
  derived from the colours above so they stay readable on your background. A green that looks right
  on black can be nearly invisible on cream, which is why this one is not a free choice.
- **We measure contrast rather than eyeball it.** If a pair falls below the accessibility threshold
  the app refuses to build and tells us which pair and by how much, and we will come back to you
  with the smallest adjustment that fixes it.

---

## 3. Screen arrangement

Tick one per row. These are the arrangements the app already draws; anything outside them is a
product change, not a setting (see section 6).

| Section | Options | Pick one |
|---|---|---|
| Home — featured products | `single` one scrolling row · `double` two stacked rows | ☐ single ☐ double |
| Home — collections | `inline` stacked wide rows · `horizontal` one scrolling row of tiles | ☐ inline ☐ horizontal |
| Product detail — photos | `single` one cover photo · `gallery` swipe through every photo | ☐ single ☐ gallery |

`gallery` only pays off if your products carry more than one photo — see section 4. A product with
a single image shows that image and does not pretend a second one failed to load.

---

## 4. Catalogue readiness

| Question | Your answer |
|---|---|
| Roughly how many products should the app show? | `___` |
| How many photos does a typical product have? | `___` |
| Do products have variants (size, colour)? If so, which option names? | `___` |
| Do you track inventory, so the app can show sold-out variants? | ☐ yes ☐ no |
| Are the products you want visible published to the sales channel the token belongs to? | ☐ yes ☐ not sure |
| Are they grouped in collections you want shown on the home screen? Which ones? | `___` |

---

## 5. Your own content

Beyond photo, title, price, description and the variant picker — which the app always draws — you
can add your own content in fixed places on the product screen and one story block on the home
screen. Each piece of content comes from a **metafield** you already have in Shopify.

### 5.1 The content you want

One row per piece of content. Fill in what you can; we confirm the technical columns against your
store before writing anything.

| What it is (your words) | Shape (pick one) | Where it goes | Metafield namespace & key | Type | Published to Storefront API? |
|---|---|---|---|---|---|
| e.g. Winter collection tag | badge | badge row | `custom.winter_collection` | boolean | yes |
| `___` | ☐ badge ☐ one line of text ☐ titled list of rows | ☐ badge row ☐ under the price ☐ above the description ☐ below the description | `___` | `___` | ☐ yes ☐ no ☐ not sure |
| `___` | ☐ badge ☐ one line of text ☐ titled list of rows | ☐ badge row ☐ under the price ☐ above the description ☐ below the description | `___` | `___` | ☐ yes ☐ no ☐ not sure |
| `___` | ☐ badge ☐ one line of text ☐ titled list of rows | ☐ badge row ☐ under the price ☐ above the description ☐ below the description | `___` | `___` | ☐ yes ☐ no ☐ not sure |

The three shapes, in plain terms:

- **badge** — a short pill next to the title. Either it shows the metafield's text, or it shows a
  label you choose whenever a yes/no metafield is on (give us that label: `___`).
- **one line of text** — a quiet sentence under the price. No label prefix, so write it as a
  sentence ("100% merino wool", not "Fabric: wool").
- **titled list of rows** — a heading plus label/value rows, from a JSON metafield. Give us the
  heading and which keys become rows:

| Heading (your words) | JSON keys to show, and the label for each |
|---|---|
| e.g. How to care | `washing` → "Washing" · `drying` → "Drying" |
| `___` | `___` |

**If a product has no value for one of these, nothing is drawn** — no heading, no divider, no empty
space. You do not need to fill a metafield on every product to keep the screen tidy.

### 5.2 Brand story on the home screen (optional)

One block of prose with an image, at the bottom of the home screen, read from a Shopify metaobject.

| Field | Your answer |
|---|---|
| Do you want it? | ☐ yes ☐ no |
| Metaobject type (API id) | `___` |
| Field holding the title | `___` |
| Field holding the body text | `___` |
| Field holding the image | `___` |

---

## 6. Anything else

Describe anything you want that sections 2–5 could not express.

`___`

This section is deliberately last and deliberately open. An answer here is not a rejection — it
means the request is a change to the app itself rather than to your configuration, so it gets
estimated and reviewed on its own, and it then becomes available to every merchant.

---

## Before you send this back

- [ ] Store domain filled in, and the Storefront token sent through a separate channel.
- [ ] Every metafield in section 5 **exists in your Shopify admin** (Settings → Custom data).
- [ ] Every one of them has **Storefront API access enabled** on its definition. This is the single
      most common blocker: a metafield that exists but is not published returns nothing to the app,
      and looks exactly like a bug in the app.
- [ ] For JSON metafields, the keys you listed are the keys actually filled on your products.
- [ ] At least one product has each piece of content, and ideally one product does not — we check
      both cases on a real device before calling it done.
