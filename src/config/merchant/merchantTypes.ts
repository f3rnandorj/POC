/** Every merchant with a config file: a new file adds its id here and to `MERCHANTS`. */
export type MerchantId = "northstar" | "atlas";

export interface MerchantConfig {
  id: MerchantId;
  credentials: MerchantCredentials;
  theme: MerchantTheme;
  screens: MerchantScreens;
}

export interface MerchantCredentials {
  storeDomain: string;
  storefrontToken: string;
  apiVersion: string;
  /**
   * Only a development store has one, and only the checkout WebView uses it: Shopify answers a
   * cookieless hit with its password page, so the app submits that form before loading the
   * checkout. Absent means the store is open and no pre-auth step runs.
   */
  storePassword?: string;
}

/** `accentText`, `success` and `danger` are absent on purpose: all three are derived. */
export interface MerchantTheme {
  primaryColor?: string;
  background?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
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
  productDetail?: ProductDetailScreen;
  home?: HomeScreen;
}

/**
 * `layout` first, then the areas top to bottom, in the order the screen stacks them below the
 * price. A screen's arrangement belongs to that screen: it is read where its areas are declared,
 * and a screen the app grows later brings its own `layout` with it instead of adding a key to a
 * map that knows every screen at once.
 *
 * The arrangements themselves stay a closed set — the merchant picks among what the app already
 * knows how to draw.
 */
export interface ProductDetailScreen {
  layout?: Partial<ProductDetailLayout>;
  badgeRow?: BadgeBlock[];
  underPrice?: TextLineBlock[];
  aboveDescription?: LabelValueBlock[];
  belowDescription?: (TextLineBlock | LabelValueBlock)[];
}

/** `media` is how the product's photos are drawn: one cover, or a paged gallery. */
export interface ProductDetailLayout {
  media: "single" | "gallery";
}

/**
 * `productRow` is the heading over the leading product row — a plain string, because the row's
 * content is the catalog itself and only its name is the merchant's. `footer` is one block, not
 * a list: the Home footer draws a single story card.
 */
export interface HomeScreen {
  layout?: Partial<HomeLayout>;
  productRow?: string;
  footer?: StoryBlock;
}

export interface HomeLayout {
  productRow: "single" | "double";
  collections: "inline" | "horizontal";
}

/** `layout` is not an area — it says how the screen draws, not what it draws. */
export type ProductDetailArea = keyof Omit<ProductDetailScreen, "layout">;

/** What the adapter walks: one product-detail area paired with the blocks declared in it. */
export type ProductDetailAreaBlocks = [ProductDetailArea, ProductBlock[]];

export type ProductBlock = BadgeBlock | TextLineBlock | LabelValueBlock;

interface BlockBase {
  /** Stable: it is the React key and the resolved block's identity. */
  id: string;
}

/** `label?: never` on the text variant blocks a label that could never render. */
export type BadgeBlock = BlockBase & { kind: "badge" } & (
    | { source: MetafieldSource<"text">; label?: never }
    | { source: MetafieldSource<"boolean">; label: string }
  );

export interface TextLineBlock extends BlockBase {
  kind: "textLine";
  source: MetafieldSource<"text">;
}

export interface LabelValueBlock extends BlockBase {
  kind: "labelValueSection";
  label: string;
  source: MetafieldSource<"json">;
  fields: BlockField[];
}

export interface StoryBlock extends BlockBase {
  kind: "story";
  source: MetaobjectSource;
}

export type MetafieldValueKind = "text" | "boolean" | "json";

export interface MetafieldSource<
  As extends MetafieldValueKind = MetafieldValueKind,
> {
  from: "metafield";
  namespace: string;
  key: string;
  as: As;
}

export interface MetaobjectSource {
  from: "metaobject";
  type: string;
  /** This merchant's field keys, mapped to the slots `StoryCard` renders. */
  fields: MetaobjectFieldMap;
}

export interface MetaobjectFieldMap {
  title?: string;
  body?: string;
  image?: string;
}

export interface BlockField {
  key: string;
  label: string;
}
