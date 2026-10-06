export enum QueryKeys {
  ProductList = "ProductList",
  ProductDetail = "ProductDetail",
  CollectionList = "CollectionList",
  CollectionDetail = "CollectionDetail",
  BrandStory = "BrandStory",
  Cart = "Cart",
}

export interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (message: string) => void;
  errorMessage?: string;
}
