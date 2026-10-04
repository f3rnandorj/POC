import { Box, Text } from "@components";

interface SectionNoteProps {
  isLoading: boolean;
  error: unknown;
  emptyText: string;
}

export function SectionNote({ isLoading, error, emptyText }: SectionNoteProps) {
  return (
    <Box paddingVertical="s16">
      <Text variant="body" color={error ? "danger" : "textMuted"}>
        {resolve(isLoading, error, emptyText)}
      </Text>
    </Box>
  );
}

function resolve(
  isLoading: boolean,
  error: unknown,
  emptyText: string,
): string {
  if (isLoading) {
    return "Loading…";
  }

  if (error) {
    return error instanceof Error
      ? error.message
      : "Could not reach the store.";
  }

  return emptyText;
}
