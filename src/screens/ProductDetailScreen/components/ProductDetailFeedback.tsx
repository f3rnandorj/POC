import { useMemo } from "react";

import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { animations } from "@assets";
import { Box, PressableBox, Text } from "@components";
import { tintLottie, useAppTheme } from "@theme";

interface ProductDetailFeedbackProps {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onBack: () => void;
}

export function ProductDetailFeedback({
  isLoading,
  error,
  onRetry,
  onBack,
}: ProductDetailFeedbackProps) {
  const { top } = useSafeAreaInsets();
  const hasError = Boolean(error);

  return (
    <Box
      flex={1}
      backgroundColor="background"
      paddingHorizontal="s16"
      justifyContent="center"
      gap="s12"
      style={{ paddingTop: top }}
    >
      {isLoading ? (
        // Centered only here: the error branch keeps the screen's left edge, because its buttons
        // read as a column of actions, not as a message.
        <Box alignItems="center" gap="s12">
          <LoadingAnimation />
          <Text variant="titleMedium" color="textMuted">
            Loading
          </Text>
          <Text variant="body" color="textMuted" textAlign="center">
            Fetching this product from the store.
          </Text>
        </Box>
      ) : (
        <>
          <Text variant="titleMedium" color={hasError ? "danger" : "textMuted"}>
            {hasError ? "Something broke" : "Product not found"}
          </Text>
          <Text variant="body" color="textMuted">
            {hasError
              ? toMessage(error)
              : "This product is no longer published."}
          </Text>

          <Box flexDirection="row" gap="s8" marginTop="s8">
            {hasError && (
              <PressableBox
                backgroundColor="accent"
                borderRadius="s2"
                paddingVertical="s12"
                paddingHorizontal="s24"
                accessibilityRole="button"
                accessibilityLabel="Try again"
                onPress={onRetry}
              >
                <Text variant="badge">Try again</Text>
              </PressableBox>
            )}
            <PressableBox
              borderWidth={1}
              borderColor="border"
              borderRadius="s2"
              paddingVertical="s12"
              paddingHorizontal="s24"
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
            >
              <Text variant="badge" color="text">
                Back
              </Text>
            </PressableBox>
          </Box>
        </>
      )}
    </Box>
  );
}

function LoadingAnimation() {
  const { colors } = useAppTheme();
  const source = useMemo(
    () => tintLottie(animations.loading, colors.accent),
    [colors.accent],
  );

  return (
    <LottieView autoPlay loop resizeMode="cover" source={source} style={BAND} />
  );
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Could not reach the store.";
}

// The asset is a 1000x1000 canvas whose three squares live in a thin band (x 190–801, y 440–559),
// so ~85% of it is empty. `cover` on a short box crops the vertical dead space away. The leftover
// horizontal padding is even on both sides (190 against 199), so centering the box centers the
// squares. Measured from the JSON.
const BAND = { width: 180, height: 36 } as const;
