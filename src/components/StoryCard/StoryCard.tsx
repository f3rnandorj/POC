import { Image } from "react-native";

import { motion } from "@theme";

import { AnimatedBox, Box } from "../Box/Box";
import { Text } from "../Text/Text";

interface StoryCardProps {
  title?: string;
  body?: string;
  image?: StoryCardImage;
}

interface StoryCardImage {
  url: string;
  altText?: string;
}

export function StoryCard({ title, body, image }: StoryCardProps) {
  if (!title && !body) {
    return null;
  }

  return (
    <AnimatedBox
      entering={motion.cardEnter}
      borderTopWidth={1}
      borderTopColor="border"
      paddingTop="s16"
      gap="s12"
    >
      {image ? (
        <Box
          backgroundColor="surface"
          borderRadius="s4"
          overflow="hidden"
          aspectRatio={16 / 9}
        >
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
    </AnimatedBox>
  );
}

const FILL = { width: "100%", height: "100%" } as const;
