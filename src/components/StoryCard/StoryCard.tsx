import { Image } from 'react-native';

import { Box } from '../Box/Box';
import { Text } from '../Text/Text';

interface StoryCardProps {
  title?: string;
  body?: string;
  image?: StoryCardImage;
}

interface StoryCardImage {
  url: string;
  altText?: string;
}

/**
 * A titled block of prose with an optional image — the brand story today, an "About" or a
 * lookbook note for the next merchant. Like every component of this family it owns its own
 * absence: no title and no body means nothing renders, hairline included (quick-rule #5).
 */
export function StoryCard({ title, body, image }: StoryCardProps) {
  if (!title && !body) {
    return null;
  }

  return (
    <Box borderTopWidth={1} borderTopColor="border" paddingTop="s16" gap="s12">
      {image ? (
        <Box backgroundColor="surface" borderRadius="s4" overflow="hidden" aspectRatio={16 / 9}>
          <Image
            source={{ uri: image.url }}
            accessibilityLabel={image.altText ?? title}
            resizeMode="cover"
            style={FILL}
          />
        </Box>
      ) : null}

      {title ? <Text variant="titleMedium">{title}</Text> : null}

      {body ? (
        <Text variant="body" color="textMuted">
          {body}
        </Text>
      ) : null}
    </Box>
  );
}

const FILL = { width: '100%', height: '100%' } as const;
