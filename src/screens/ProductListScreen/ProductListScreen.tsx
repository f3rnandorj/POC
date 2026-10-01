import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, PressableBox, Text } from '@components';
import type { AppScreenProps } from '@routes';

export function ProductListScreen({ navigation }: AppScreenProps<'ProductList'>) {
  const { top } = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background" paddingHorizontal="s16" style={{ paddingTop: top }}>
      <Box flex={1} justifyContent="center" gap="s12">
        <Text variant="titleMedium" color="textMuted">
          Catalog
        </Text>
        <Text variant="displayLarge">No products yet</Text>
        <Text variant="body" color="textMuted">
          This screen is the grid's placeholder. It stays empty until the Storefront adapter lands.
        </Text>
      </Box>

      <PressableBox
        borderWidth={1}
        borderColor="border"
        borderRadius="s2"
        paddingVertical="s16"
        alignItems="center"
        marginBottom="s32"
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={navigation.goBack}>
        <Text variant="badge" color="text">
          Back
        </Text>
      </PressableBox>
    </Box>
  );
}
