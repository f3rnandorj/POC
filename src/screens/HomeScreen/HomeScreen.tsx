import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, PressableBox, Text } from '@components';
import type { AppScreenProps } from '@routes';

export function HomeScreen({ navigation }: AppScreenProps<'Home'>) {
  const { top } = useSafeAreaInsets();

  return (
    <Box
      flex={1}
      backgroundColor="background"
      paddingHorizontal="s16"
      style={{ paddingTop: top }}
    >
      <Box flex={1} justifyContent="center" gap="s12">
        <Text variant="titleMedium" color="textMuted">
          Shop
        </Text>
        <Text variant="displayLarge">Foundation</Text>
        <Text variant="body" color="textMuted">
          The shell boots, the theme resolves and the stack navigates. Product
          data arrives in the next block.
        </Text>
      </Box>

      <PressableBox
        backgroundColor="accent"
        borderRadius="s2"
        paddingVertical="s16"
        alignItems="center"
        marginBottom="s32"
        accessibilityRole="button"
        accessibilityLabel="Browse products"
        onPress={() => navigation.navigate('ProductList')}
      >
        <Text variant="badge">Browse products</Text>
      </PressableBox>
    </Box>
  );
}
