export interface MoneyV2Api {
  amount: string;
  currencyCode: string;
}

export interface ImageApi {
  url: string;
  altText: string | null;
}

export interface EdgesApi<TNode> {
  edges: { node: TNode }[];
}

/** `namespace` is selected because `custom.badge` and `promo.badge` are different metafields. */
export interface MetafieldApi {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface GraphQLErrorApi {
  message: string;
}

export interface GraphQLResponseApi<TData> {
  data?: TData;
  errors?: GraphQLErrorApi[];
}
