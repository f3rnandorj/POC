/**
 * Atlas's content. Deliberately not a copy of the other store: different garments, different
 * price band, different photography, and a different set of metafields — `fabric_type` and
 * `fit_guide` where the other catalogue says `material` and knows nothing about fit.
 *
 * **Every photo is one garment, hung, against a pale plaster wall.** Three of the four come from
 * a single shoot (same branch, same wall, same mound of sand), which is what gives this store a
 * look of its own rather than a second pass at the same one. Twenty-seven candidates were opened
 * and looked at to find four: free stock has no isolated-garment set, so the line below is written
 * around the photos that exist, never the reverse.
 *
 * Covers are linen weave rather than garments — a fabric-led brand, matching the blocks it declares.
 *
 * Metafield coverage is uneven on purpose: one product carries four, one carries one, and one
 * carries none. The bare one is what proves quick-rule #5 on a running screen.
 */

const PHOTO = {
  linenHenley:
    "https://images.unsplash.com/photo-1713881587420-113c1c43e28a?q=85&w=1600&fm=jpg",
  indigoLinen:
    "https://images.unsplash.com/photo-1713881649391-a1c8ddaf83cd?q=85&w=1600&fm=jpg",
  oatmealLinen:
    "https://images.unsplash.com/photo-1693443688057-85f57b872a3c?q=85&w=1600&fm=jpg",
  cottonTee:
    "https://images.unsplash.com/photo-1720239021870-ffecff7b4f48?q=85&w=1600&fm=jpg",
  coverFrontpage:
    "https://images.unsplash.com/photo-1588610992315-5654831ceebd?q=85&w=1600&fm=jpg",
  coverEssentials:
    "https://images.unsplash.com/photo-1776278515617-09ab61ec1eb8?q=85&w=1600&fm=jpg",
};

const SIZES = ["S", "M", "L", "XL"];

export const COLLECTIONS = [
  { handle: "frontpage", image: PHOTO.coverFrontpage },
  { handle: "essentials", image: PHOTO.coverEssentials },
];

/** Nothing predates this script in Atlas's store, so there is nothing to restyle. */
export const RESTYLED = [];

export const PRODUCTS = [
  {
    handle: "linen-grandad-shirt",
    title: "Linen Grandad Shirt",
    description:
      "Washed European linen, collarless, cut square through the body. It creases the moment you wear it, which is the point.",
    productType: "Shirt",
    price: "245.00",
    image: PHOTO.linenHenley,
    sizes: SIZES,
    soldOut: ["S"],
    collections: ["frontpage"],
    metafields: {
      badge: "NEW SEASON",
      fabric_type: "Washed European Linen",
      fit_guide: {
        cut: "Relaxed through the chest",
        length: "Hits at the hip",
      },
      care_instructions: {
        washing: "Machine wash cold, gentle",
        drying: "Line dry in shade",
      },
    },
  },
  {
    handle: "indigo-linen-overshirt",
    title: "Indigo Linen Overshirt",
    description:
      "Piece-dyed indigo with a dropped hem and a single chest seam. Heavy enough to wear as a layer, light enough to wear alone.",
    productType: "Shirt",
    price: "320.00",
    image: PHOTO.indigoLinen,
    sizes: ["M", "L", "XL"],
    collections: ["frontpage", "essentials"],
    metafields: {
      fabric_type: "Piece-Dyed Indigo Linen",
      promotion_text: "Complimentary alterations in store",
      care_instructions: {
        washing: "Hand wash cold, separately",
        drying: "Dry flat, reshape damp",
      },
    },
  },
  {
    handle: "oatmeal-linen-tee",
    title: "Oatmeal Linen Tee",
    description:
      "An open-weave linen tee in undyed oatmeal. Notched neck, no logo, no hem stitch.",
    productType: "Top",
    price: "165.00",
    image: PHOTO.oatmealLinen,
    sizes: SIZES,
    soldOut: ["XL"],
    collections: ["essentials"],
    metafields: {
      fabric_type: "Undyed Open-Weave Linen",
    },
  },
  {
    // In no collection and carrying no metafield: the bare case, on purpose.
    handle: "heavyweight-cotton-tee",
    title: "Heavyweight Cotton Tee",
    description:
      "A 260gsm cotton tee with a ribbed neck that holds its shape. White, and nothing else.",
    productType: "Top",
    price: "145.00",
    image: PHOTO.cottonTee,
    sizes: SIZES,
    collections: [],
    metafields: {},
  },
];
