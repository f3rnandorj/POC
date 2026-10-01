import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Home: undefined;
  ProductList: undefined;
};

export type AppScreenProps<TRoute extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, TRoute>;
