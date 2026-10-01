import { Box, Text } from '@components';

interface SectionNoteProps {
  isLoading: boolean;
  error: unknown;
  emptyText: string;
}

/**
 * Home's non-content states. One muted line per section, not the full retry block — the
 * list screen owns that, and a home page full of error boxes is noise, not information.
 */
export function SectionNote({ isLoading, error, emptyText }: SectionNoteProps) {
  return (
    <Box paddingVertical="s16">
      <Text variant="body" color={error ? 'danger' : 'textMuted'}>
        {resolve(isLoading, error, emptyText)}
      </Text>
    </Box>
  );
}

function resolve(isLoading: boolean, error: unknown, emptyText: string): string {
  if (isLoading) {
    return 'Loading…';
  }

  if (error) {
    return error instanceof Error ? error.message : 'Could not reach the store.';
  }

  return emptyText;
}
