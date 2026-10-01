import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen, ProductListScreen } from '@screens';
import { useAppTheme } from '@theme';

import type { AppStackParamList } from './types/navigationTypes';

export function AppStack() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
    </Stack.Navigator>
  );
}

const Stack = createNativeStackNavigator<AppStackParamList>();
