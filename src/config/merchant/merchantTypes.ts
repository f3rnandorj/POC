export type MerchantId = "northstar" | "atlas";

export interface MerchantConfig {
  id: MerchantId;
  credentials: MerchantCredentials;
  theme: MerchantTheme;
  metaobjectSources?: MetaobjectSources;
  screens: MerchantScreens;
}

export interface MerchantCredentials {
  /** No scheme: `{shop}.myshopify.com` or the custom domain. */
  storeDomain: string;
  /** Public and read-only — safe on a device, never a tracked literal. */
  storefrontToken: string;
  /** Pinned (`2026-01`): unpinned, the response shape drifts. */
  apiVersion: string;
  /** Development stores only: Shopify answers a cookieless hit with its password page. */
  storePassword?: string;
}

/** A key left out keeps the base token. `accentText`, `success` and `danger` are derived. */
export interface MerchantTheme {
  primaryColor?: string;
  background?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
  border?: string;
}

export interface MerchantScreens {
  productDetail?: ProductDetailScreen;
  home?: HomeScreen;
}

export interface ProductDetailScreen {
  layout?: Partial<ProductDetailLayout>;
  metafields?: ProductDetailMetafields;
  metaobjects?: ProductDetailMetaobjects;
}

export interface ProductDetailMetafields {
  badgeRow?: BadgeBlock[];
  textLines?: TextLineBlock[];
  aboveDescription?: LabelValueBlock[];
  belowDescription?: (TextLineBlock | LabelValueBlock)[];
}

export interface ProductDetailMetaobjects {
  footer?: StoryBlock[];
}

export interface ProductDetailLayout {
  media: "gallery" | "filmstrip";
}

export interface HomeScreen {
  layout?: Partial<HomeLayout>;
  mainProductRowTitle?: string;
  metaobjects?: HomeMetaobjects;
}

export interface HomeMetaobjects {
  header?: StoryBlock[];
  footer?: StoryBlock[];
}

export interface HomeLayout {
  mainProductRow: "single" | "double" | "carousel";
  collections: "inline" | "horizontal";
}

export type ProductDetailArea =
  | keyof ProductDetailMetafields
  | keyof ProductDetailMetaobjects;

export type HomeArea = keyof HomeMetaobjects;

export type AreaBlocks<Area extends string = string> = [Area, ContentBlock[]];

export type ContentBlock =
  | BadgeBlock
  | TextLineBlock
  | LabelValueBlock
  | StoryBlock;

export type MetafieldBlock = BadgeBlock | TextLineBlock | LabelValueBlock;

interface BlockBase {
  /** Unique within its screen: resolution pairs a resolved block back through this id. */
  id: string;
}

/** `label?: never` on the text variant blocks a label that can never render. */
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
  source: MetaobjectRef;
}

export interface MetaobjectRef {
  from: "metaobject";
  ref: string;
}

/** How the adapter must read the metafield's always-string `value`. */
export type MetafieldValueKind = "text" | "boolean" | "json";

export interface MetafieldSource<
  As extends MetafieldValueKind = MetafieldValueKind,
> {
  from: "metafield";
  /** Part of the metafield's identity: `custom.badge` ≠ `promo.badge`. */
  namespace: string;
  key: string;
  as: As;
}

export type MetaobjectSources = Record<string, MetaobjectSource>;

export interface MetaobjectSource {
  /** Named here because Storefront has no query listing a store's definitions. */
  type: string;
  /** Absent takes `METAOBJECT_PAGE_SIZE`. */
  first?: number;
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
