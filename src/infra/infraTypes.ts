export enum QueryKeys {
  ProductList = "ProductList",
  ProductDetail = "ProductDetail",
  CollectionList = "CollectionList",
  CollectionDetail = "CollectionDetail",
  Metaobject = "Metaobject",
  Cart = "Cart",
}

export interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (message: string) => void;
  errorMessage?: string;
}
