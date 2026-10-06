import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AppStackParamList = {
  Home: undefined;
  /** Absent scope means the whole catalog. */
  ProductList: { collectionHandle?: string } | undefined;
  /** Ids over objects — the detail screen fetches its own data so React Query owns the cache. */
  ProductDetail: { handle: string };
  Cart: undefined;
  Checkout: undefined;
  /** Absent reference means Shopify's page carried no order number — the screen shows none. */
  CheckoutResult: { reference?: string };
};

export type AppScreenProps<TRoute extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, TRoute>;
