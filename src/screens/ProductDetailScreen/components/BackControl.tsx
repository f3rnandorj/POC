import { Box, PressableBox, Text } from '@components';

interface BackControlProps {
  onPress: () => void;
  top: number;
}

/**
 * The stack runs with `headerShown: false` to keep the image full-bleed, so the iOS
 * edge-swipe would otherwise be the only way back — unusable for anyone who cannot
 * perform the gesture. This is the visible, focusable equivalent.
 */
export function BackControl({ onPress, top }: BackControlProps) {
  return (
    <Box position="absolute" left={0} right={0} zIndex={1} style={{ top: top + 8 }}>
      <Box paddingHorizontal="s16" alignItems="flex-start">
        <PressableBox
          backgroundColor="background"
          borderRadius="s2"
          paddingVertical="s8"
          paddingHorizontal="s12"
          opacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onPress}
        >
          <Text variant="badge" color="text">
            Back
          </Text>
        </PressableBox>
      </Box>
    </Box>
  );
}
