import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Home: undefined;
  ProductList: undefined;
  /** Ids over objects — the detail screen fetches its own data so React Query owns the cache. */
  ProductDetail: { handle: string };
};

export type AppScreenProps<TRoute extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, TRoute>;
