import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useCartGetDetail } from "@domain";
// Type-only, so this never becomes an import cycle with the stack that renders these screens.
import type { AppStackParamList } from "@routes";

import { Box } from "../Box/Box";
import { PressableBox } from "../PressableBox/PressableBox";
import { Text } from "../Text/Text";

export interface CartButtonProps {
  /** Over a photo instead of in a header row — same treatment as the floating back control. */
  floating?: boolean;
}

/**
 * Lives on every screen through `Screen`, so it navigates itself rather than taking a handler
 * each screen would have to repeat.
 */
export function CartButton({ floating = false }: CartButtonProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { cart } = useCartGetDetail();
  const count = cart?.totalQuantity ?? 0;

  return (
    <PressableBox
      backgroundColor={floating ? "background" : "surface"}
      opacity={floating ? 0.85 : 1}
      borderRadius="s2"
      paddingVertical="s8"
      paddingHorizontal="s12"
      flexDirection="row"
      alignItems="center"
      gap="s8"
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Cart, ${count} items` : "Cart, empty"}
      onPress={() => navigation.navigate("Cart")}
    >
      <Text variant="badge" color="text">
        Cart
      </Text>

      {/* An empty cart carries no badge — no zero, no reserved space. */}
      {count > 0 ? (
        <Box backgroundColor="accent" borderRadius="s2" paddingHorizontal="s4">
          <Text variant="badge">{count}</Text>
        </Box>
      ) : null}
    </PressableBox>
  );
}
