import { Box } from '../Box/Box';
import { PressableBox } from '../PressableBox/PressableBox';
import { Text } from '../Text/Text';

interface BackControlProps {
  onPress: () => void;
  /**
   * Safe-area offset for the floating variant, used where the control sits over a
   * full-bleed image. Omit it and the control sits in normal flow instead.
   */
  top?: number;
}

/**
 * The stack runs with `headerShown: false`, so the iOS edge-swipe would otherwise be the
 * only way back — unusable for anyone who cannot perform the gesture. This is the visible,
 * focusable equivalent, and every screen that is not the stack root carries one.
 */
export function BackControl({ onPress, top }: BackControlProps) {
  const control = (
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
  );

  if (top === undefined) {
    return control;
  }

  return (
    <Box position="absolute" left={0} right={0} zIndex={1} style={{ top: top + 8 }}>
      {control}
    </Box>
  );
}
