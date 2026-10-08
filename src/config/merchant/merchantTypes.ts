/** Every merchant with a config file: a new file adds its id here and to `MERCHANTS`. */
export type MerchantId = "northstar" | "atlas";

/** A merchant's whole say over the app — nothing outside these four keys varies. */
export interface MerchantConfig {
  /** Who this is: the key in `MERCHANTS`, the `.env` prefix and the cart's namespace. */
  id: MerchantId;
  /** Which Shopify store the app talks to, and with what token. */
  credentials: MerchantCredentials;
  /** The brand colors. */
  theme: MerchantTheme;
  /**
   * The store's metaobjects: every type this merchant draws sections from, declared once and
   * pointed at by `ref`. One place answers "which metaobjects does this store use?", and a type
   * used on two screens is written once.
   */
  metaobjectSources?: MetaobjectSources;
  /** What each screen draws, and in what order. */
  screens: MerchantScreens;
}

export interface MerchantCredentials {
  /** Host of the Storefront endpoint, no scheme: `{shop}.myshopify.com` or the custom domain. */
  storeDomain: string;
  /** The public Storefront token — read-only, safe on a device, and never a tracked literal. */
  storefrontToken: string;
  /** Storefront version pinned in the URL (`2026-01`): unpinned, the response shape drifts. */
  apiVersion: string;
  /**
   * Only a development store has one, and only the checkout WebView uses it: Shopify answers a
   * cookieless hit with its password page, so the app submits that form before loading the
   * checkout. Absent means the store is open and no pre-auth step runs.
   */
  storePassword?: string;
}

/**
 * Every key is optional and what is left out keeps the app's base token, so a merchant overrides
 * only the colors it cares about. `accentText`, `success` and `danger` are absent on purpose:
 * all three are derived.
 */
export interface MerchantTheme {
  /** The accent: buttons, badges, selected states. Its text color is derived by contrast. */
  primaryColor?: string;
  /** The screen behind everything — and what the state colors read to pick light or dark. */
  background?: string;
  /** Anything laid over the background: cards, tiles, pickers, dialogs. */
  surface?: string;
  /** Default foreground — titles, prices, labels. */
  text?: string;
  /** Secondary prose: the description and the merchant's own text lines. */
  textMuted?: string;
  /** Hairlines and dividers. */
  border?: string;
}

/**
 * The merchant's content, one key per screen and, inside it, one key per **area** that screen
 * draws. "Area" and not "section" because `labelValueSection` is already a block kind — a
 * section is something you put *in* an area.
 *
 * - The **key path** is where it lands, so no block carries a `slot`.
 * - The **array order** is the render order, so no block carries an `order`.
 * - The **element type** is what that area accepts, so a merchant cannot express an arrangement
 *   the renderer cannot draw.
 *
 * Every key is optional and an omitted key renders nothing — no heading, no divider, no gap.
 * The parts that always render (photo, title, price, description, variant picker) are not here:
 * they are the app's, not the merchant's.
 */
export interface MerchantScreens {
  /** One product's page: its photos, then the areas stacked around the description. */
  productDetail?: ProductDetailScreen;
  /** The store's landing screen: products, collections, and story sections around them. */
  home?: HomeScreen;
}

/**
 * `layout` first, then the positions, grouped by where their values come from. A screen's
 * arrangement belongs to that screen: it is read where its areas are declared, and a screen the
 * app grows later brings its own `layout` with it instead of adding a key to a map that knows
 * every screen at once.
 */
export interface ProductDetailScreen {
  /** How this screen draws, before what it draws. A key left out takes the base arrangement. */
  layout?: Partial<ProductDetailLayout>;
  /** Positions fed by the product's own metafields. */
  metafields?: ProductDetailMetafields;
  /** Positions fed by the store's metaobjects. */
  metaobjects?: ProductDetailMetaobjects;
}

/**
 * The metafield-backed positions of this screen, top to bottom in the order the screen stacks
 * them below the price.
 */
export interface ProductDetailMetafields {
  /** Pills under the price, side by side in array order. */
  badgeRow?: BadgeBlock[];
  /** Muted one-liners under the badges — fabric, shipping, a promotion. */
  textLines?: TextLineBlock[];
  /** Titled label/value sections placed before the description. */
  aboveDescription?: LabelValueBlock[];
  /** After the description, where a merchant may mix plain lines with titled sections. */
  belowDescription?: (TextLineBlock | LabelValueBlock)[];
}

/**
 * The metaobject-backed positions of this screen. They never repeat a metafield position's name:
 * a position belongs to exactly one of the two groups, so no area ever has to merge two sources
 * and invent an order between them.
 */
export interface ProductDetailMetaobjects {
  /** Closing the screen, under the variant picker. */
  footer?: StoryBlock[];
}

/** The arrangements stay a closed set — the merchant picks what the app can already draw. */
export interface ProductDetailLayout {
  /**
   * How the product's photos are drawn — two arrangements of the same images:
   *
   * - `gallery` — one photo at a time, paged by swipe, with page indicators
   * - `filmstrip` — one hero photo picked from a thumbnail strip under it
   */
  media: "gallery" | "filmstrip";
}

export interface HomeScreen {
  /** How this screen draws, before what it draws. A key left out takes the base arrangement. */
  layout?: Partial<HomeLayout>;
  /**
   * The heading over the main product row — a plain string, because the row's content is the
   * catalog itself and only its name is the merchant's. Absent means the row runs untitled.
   */
  mainProductRowTitle?: string;
  /** Sections read from the store's metaobjects, in positions of their own. */
  metaobjects?: HomeMetaobjects;
}

/** Same rule as the detail screen's: these positions exist in this tree only. */
export interface HomeMetaobjects {
  /** Opening the screen, above the main product row. */
  header?: StoryBlock[];
  /** Closing the screen, under the collections. */
  footer?: StoryBlock[];
}

/** The arrangements stay a closed set — the merchant picks what the app can already draw. */
export interface HomeLayout {
  /**
   * How the main product row is drawn: one scrolling row, two stacked rows, or a paged carousel
   * of one product per page. All three split or page the products already fetched.
   */
  mainProductRow: "single" | "double" | "carousel";
  /** Collections as a scrolling row of tiles (`horizontal`) or stacked wide rows (`inline`). */
  collections: "inline" | "horizontal";
}

/**
 * Every position of the screen, from both groups. `metafields` and `metaobjects` are groups of
 * positions, not positions, and `layout` says how the screen draws rather than what it draws.
 */
export type ProductDetailArea =
  | keyof ProductDetailMetafields
  | keyof ProductDetailMetaobjects;

/** `layout` and `mainProductRowTitle` are not positions; every home position is metaobject-backed. */
export type HomeArea = keyof HomeMetaobjects;

/** What a resolver walks: one area paired with the blocks declared in it, in declaration order. */
export type AreaBlocks<Area extends string = string> = [Area, ContentBlock[]];

/** Every kind an area may hold, whatever the screen and whatever the source. */
export type ContentBlock =
  | BadgeBlock
  | TextLineBlock
  | LabelValueBlock
  | StoryBlock;

/** The blocks the product document queries: the ones whose source is a product metafield. */
export type MetafieldBlock = BadgeBlock | TextLineBlock | LabelValueBlock;

interface BlockBase {
  /**
   * Stable, and **unique within its screen**: resolution pairs a resolved block back to the block
   * that declared it through this id, which is how one area can mix sources and still render in
   * declaration order. The same id in two areas of one screen renders in both.
   */
  id: string;
}

/**
 * Draws a `ProductBadge`. A text source renders its own value; a boolean one renders the block's
 * `label` when true — `label?: never` on the text variant blocks a label that can never render.
 */
export type BadgeBlock = BlockBase & { kind: "badge" } & (
    | { source: MetafieldSource<"text">; label?: never }
    | { source: MetafieldSource<"boolean">; label: string }
  );

export interface TextLineBlock extends BlockBase {
  /** Draws one muted line of prose, with no label prefix. */
  kind: "textLine";
  /** The text metafield whose value is the line. */
  source: MetafieldSource<"text">;
}

export interface LabelValueBlock extends BlockBase {
  /** Draws a `ProductSection`: a heading over label/value rows. */
  kind: "labelValueSection";
  /** The section's heading, in the merchant's own words. */
  label: string;
  /** The JSON metafield holding the rows' values, keyed by `fields[].key`. */
  source: MetafieldSource<"json">;
  /** Which JSON keys become rows, their labels, and the order they appear in. */
  fields: BlockField[];
}

export interface StoryBlock extends BlockBase {
  /**
   * Draws a `StoryCard` per metaobject entry: image, title and body. One block is one metaobject
   * type, and the store decides how many sections come out of it — three entries draw three.
   */
  kind: "story";
  /** Which entry of `metaobjectSources` holds the stories. */
  source: MetaobjectRef;
}

export interface MetaobjectRef {
  /** Discriminates the source: this block reads a metaobject, not a product metafield. */
  from: "metaobject";
  /** A key of the merchant's `metaobjectSources`. An unknown one fails the block's query. */
  ref: string;
}

/** How the adapter must read the metafield's always-string `value`. */
export type MetafieldValueKind = "text" | "boolean" | "json";

export interface MetafieldSource<
  As extends MetafieldValueKind = MetafieldValueKind,
> {
  /** Discriminates the source: this block reads a product metafield. */
  from: "metafield";
  /** The metafield's namespace — part of its identity, so `custom.badge` ≠ `promo.badge`. */
  namespace: string;
  /** The metafield's key inside that namespace. */
  key: string;
  /** How to parse `value`, and therefore which block kinds may point at it. */
  as: As;
}

/** The merchant's metaobject registry, keyed by the name its blocks point at. */
export type MetaobjectSources = Record<string, MetaobjectSource>;

export interface MetaobjectSource {
  /**
   * The metaobject definition's type handle, as the Shopify admin names it. Storefront has no
   * query that lists a store's definitions (that is the Admin API, and a server-side token), so
   * the types a merchant wants on screen are named here.
   */
  type: string;
  /**
   * How many entries of that type to collect, newest-first as Shopify orders them. Absent takes
   * `METAOBJECT_PAGE_SIZE`; the store having fewer is the normal case, not an error.
   */
  first?: number;
  /** This merchant's field keys, mapped to the slots `StoryCard` renders. */
  fields: MetaobjectFieldMap;
}

export interface MetaobjectFieldMap {
  /** Field key holding the heading. */
  title?: string;
  /** Field key holding the prose. */
  body?: string;
  /** Field key holding the image reference. */
  image?: string;
}

export interface BlockField {
  /** The key to read inside the parsed JSON value. */
  key: string;
  /** What the row is called on screen. */
  label: string;
}
