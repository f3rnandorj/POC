export type AreaContent<Area extends string> = Partial<
  Record<Area, ResolvedBlock[]>
>;

export type ResolvedBlock =
  | ResolvedBadge
  | ResolvedTextLine
  | ResolvedLabelValueSection
  | ResolvedStory;

/** `id` is the declaring block's id: resolution reads the area and the order from it. */
interface ResolvedBase {
  id: string;
}

export interface ResolvedBadge extends ResolvedBase {
  kind: "badge";
  text: string;
}

export interface ResolvedTextLine extends ResolvedBase {
  kind: "textLine";
  text: string;
}

export interface ResolvedLabelValueSection extends ResolvedBase {
  kind: "labelValueSection";
  title: string;
  items: ResolvedItem[];
}

/** One metaobject entry: several resolved stories share one `id`, keyed by position. */
export interface ResolvedStory extends ResolvedBase {
  kind: "story";
  title?: string;
  body?: string;
  image?: ResolvedImage;
}

export interface ResolvedItem {
  label: string;
  value: string;
}

export interface ResolvedImage {
  url: string;
  altText?: string;
}
