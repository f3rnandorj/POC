import { Box, PressableBox, Text } from "@components";

interface ProductListFeedbackProps {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  emptyText: string;
}

export function ProductListFeedback({
  isLoading,
  error,
  onRetry,
  emptyText,
}: ProductListFeedbackProps) {
  if (isLoading) {
    return (
      <Box paddingVertical="s32" gap="s8">
        <Text variant="titleMedium" color="textMuted">
          Loading
        </Text>
        <Text variant="body" color="textMuted">
          Fetching the latest from the store.
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box paddingVertical="s32" gap="s12" alignItems="flex-start">
        <Text variant="titleMedium" color="danger">
          Something broke
        </Text>
        <Text variant="body" color="textMuted">
          {toMessage(error)}
        </Text>
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
      </Box>
    );
  }

  return (
    <Box paddingVertical="s32" gap="s8">
      <Text variant="titleMedium" color="textMuted">
        Nothing here yet
      </Text>
      <Text variant="body" color="textMuted">
        {emptyText}
      </Text>
    </Box>
  );
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Could not reach the store.";
}
