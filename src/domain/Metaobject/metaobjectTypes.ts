import type { EdgesApi, ImageApi } from "@api";

/**
 * A metaobject field holding a file carries a gid in `value`; only `reference` resolves to
 * something renderable. Text fields carry their value and no reference.
 */
export interface MetaobjectFieldApi {
  key: string;
  value: string | null;
  reference: { image: ImageApi } | null;
}

export interface MetaobjectNodeApi {
  id: string;
  handle: string;
  fields: MetaobjectFieldApi[];
}

export interface MetaobjectListApi {
  metaobjects: EdgesApi<MetaobjectNodeApi>;
}
