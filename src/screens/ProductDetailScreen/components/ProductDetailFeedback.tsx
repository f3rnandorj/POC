import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, PressableBox, Text } from '@components';

interface ProductDetailFeedbackProps {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onBack: () => void;
}

/** Loading, error and not-found for the detail route, in the project identity. */
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
        <>
          <Text variant="titleMedium" color="textMuted">
            Loading
          </Text>
          <Text variant="body" color="textMuted">
            Fetching this product from the store.
          </Text>
        </>
      ) : (
        <>
          <Text variant="titleMedium" color={hasError ? 'danger' : 'textMuted'}>
            {hasError ? 'Something broke' : 'Product not found'}
          </Text>
          <Text variant="body" color="textMuted">
            {hasError ? toMessage(error) : 'This product is no longer published.'}
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

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not reach the store.';
}
