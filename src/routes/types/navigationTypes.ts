import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AppStackParamList = {
  Home: undefined;
  /** Absent scope means the whole catalog. */
  ProductList: { collectionHandle?: string } | undefined;
  /** Ids over objects — the detail screen fetches its own data so React Query owns the cache. */
  ProductDetail: { handle: string };
};

export type AppScreenProps<TRoute extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, TRoute>;
