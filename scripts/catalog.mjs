/**
 * The seed's content, kept apart from the machinery that uploads it.
 *
 * **Every photo is the garment alone on a plain light background.** That constraint is the whole
 * point: a grid mixing studio shots, moody portraits and flat lays reads as a stock-photo grab
 * bag, and an earlier pass shipped one flat lay with Puma and Champion products in frame and a
 * hooded figure in a Guy Fawkes mask. Free stock has no "garment alone on black" set, so the
 * catalogue standardises on light instead — dark UI, light product tile, the way most apparel
 * storefronts do it.
 *
 * The product line is written around photos that exist and are free to use. There is no hoodie
 * here because there is no free hoodie-alone shot; inventing the product and pairing it with a
 * portrait is exactly how the first pass went wrong.
 *
 * Photos are Unsplash direct URLs, resolved once and pinned so a rerun fetches the same image
 * instead of a new random one. Shopify downloads them server-side — no staged upload step.
 *
 * Metafield coverage is uneven on purpose: some products carry four, some two, and three carry
 * none. The bare ones are what prove quick-rule #5 in the running app.
 */

const PHOTO = {
  whiteTee:
    "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  blackTee:
    "https://images.unsplash.com/photo-1610502778270-c5c6f4c7d575?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  longSleeve:
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  denimJacket:
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  beanie:
    "https://images.unsplash.com/photo-1544967919-44c1ef2f9e7a?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  heavyCrew:
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  blackDenim:
    "https://images.unsplash.com/photo-1718252540617-6ecda2b56b57?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  blueDenim:
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  hangerTee:
    "https://images.unsplash.com/photo-1778671394516-8270eac13c42?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  cap: "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  coverWinter:
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
  coverEssentials:
    "https://images.unsplash.com/photo-1581655353466-d5ad6765dd37?ixlib=rb-4.1.0&q=85&fm=jpg&w=1600",
};

const SIZES = ["S", "M", "L", "XL"];

export const COLLECTIONS = [
  { handle: "frontpage", image: PHOTO.coverWinter },
  { handle: "essentials", image: PHOTO.coverEssentials },
];

/**
 * The two products that predate this script. They keep their copy, price, variants and
 * metafields — only the photo is restyled, and the original is left in place behind it rather
 * than deleted, so the AI-generated shots are one reorder away from coming back.
 */
export const RESTYLED = [
  { handle: "northstar-essential", image: PHOTO.whiteTee },
  { handle: "everyday-tee", image: PHOTO.blackTee },
];

/** Seeded by an earlier pass and replaced below. Deleted with the user's explicit approval. */
export const OBSOLETE = [
  "heavyweight-hoodie",
  "wool-overshirt",
  "thermal-long-sleeve",
  "canvas-work-jacket",
  "everyday-crew",
];

export const PRODUCTS = [
  {
    handle: "long-sleeve-tee",
    title: "Long Sleeve Tee",
    description:
      "A mid-weight long sleeve cut slim through the body so it layers without bunching. Ribbed cuffs that stay put past the elbow.",
    productType: "Top",
    price: "119.00",
    image: PHOTO.longSleeve,
    sizes: ["S", "M", "L"],
    collections: ["frontpage"],
    metafields: {
      material: "Waffle-Knit Cotton",
      is_winter_collection: "true",
      promotion_text: "Free shipping above $199",
    },
  },
  {
    handle: "denim-work-jacket",
    title: "Denim Work Jacket",
    description:
      "Twelve-ounce denim that softens with wear and never quite gives up. Four pockets, triple-stitched seams, cut square.",
    productType: "Jacket",
    price: "279.00",
    image: PHOTO.denimJacket,
    sizes: ["M", "L", "XL"],
    soldOut: ["XL"],
    collections: ["frontpage"],
    metafields: {
      badge: "LIMITED RUN",
      material: "12oz Rigid Denim",
      is_winter_collection: "true",
      care_instructions: {
        washing: "Machine wash cold, separately",
        drying: "Tumble dry low",
      },
    },
  },
  {
    handle: "knit-beanie",
    title: "Knit Beanie",
    description:
      "Ribbed merino, cuffed, no logo. The one that lives in a jacket pocket all winter.",
    productType: "Accessory",
    price: "49.00",
    image: PHOTO.beanie,
    collections: ["frontpage"],
    metafields: {
      material: "Merino Wool",
      is_winter_collection: "true",
    },
  },
  {
    handle: "heavy-crew-tee",
    title: "Heavy Crew Tee",
    description:
      "A 240gsm crew that holds its shape on the shoulder instead of collapsing. Double-stitched hem, no print.",
    productType: "Top",
    price: "139.00",
    image: PHOTO.heavyCrew,
    sizes: SIZES,
    soldOut: ["S"],
    // In both on purpose: the collections overlap, so the app is not showing two disjoint lists.
    collections: ["frontpage", "essentials"],
    metafields: {
      badge: "NEW IN",
      material: "Heavyweight Organic Cotton",
      is_winter_collection: "true",
      care_instructions: {
        washing: "Machine wash cold, inside out",
        drying: "Line dry, do not tumble",
      },
    },
  },
  {
    handle: "straight-leg-denim",
    title: "Straight Leg Denim",
    description:
      "A straight leg with room through the thigh. Garment-dyed, so the colour settles after the first wash rather than fading.",
    productType: "Trousers",
    price: "159.00",
    image: PHOTO.blackDenim,
    sizes: SIZES,
    // The only product priced apart by variant — enough to prove the detail screen reads the
    // selected variant and not the product's base price.
    variantPrices: { XL: "169.00" },
    collections: ["essentials"],
    metafields: {
      material: "Garment-Dyed Cotton Twill",
      promotion_text: "Free shipping above $199",
    },
  },
  {
    handle: "selvedge-denim",
    title: "Selvedge Denim",
    description:
      "Unwashed selvedge woven on a shuttle loom, finished with a chain-stitched hem. Wears in, not out.",
    productType: "Trousers",
    price: "229.00",
    image: PHOTO.blueDenim,
    sizes: ["S", "M", "L"],
    collections: ["essentials"],
    metafields: {
      material: "14oz Japanese Selvedge",
      care_instructions: {
        washing: "Wash cold, inside out, sparingly",
        drying: "Hang dry away from sun",
      },
    },
  },
  {
    handle: "boxy-tee",
    title: "Boxy Tee",
    description:
      "A wider body and a shorter sleeve than the Essential. Nothing printed on it.",
    productType: "Top",
    price: "109.00",
    image: PHOTO.hangerTee,
    sizes: ["S", "M", "L"],
    collections: ["essentials"],
    metafields: {},
  },
  {
    handle: "cotton-cap",
    title: "Cotton Cap",
    description:
      "Six-panel, unstructured, brass closure. Softens into the shape of your head and stays there.",
    productType: "Accessory",
    price: "59.00",
    image: PHOTO.cap,
    // In neither collection on purpose: the catalogue needs a product reachable only from
    // "All products", so the unscoped list is not just the union of the two collections.
    collections: [],
    metafields: {},
  },
];
