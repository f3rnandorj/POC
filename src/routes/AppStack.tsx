import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  CartScreen,
  CheckoutResultScreen,
  CheckoutScreen,
  HomeScreen,
  ProductDetailScreen,
  ProductListScreen,
} from "@screens";
import { useAppTheme } from "@theme";

import type { AppStackParamList } from "./types/navigationTypes";

export function AppStack() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="CheckoutResult"
        component={CheckoutResultScreen}
        // A finished checkout is not a screen to swipe back into.
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

const Stack = createNativeStackNavigator<AppStackParamList>();
