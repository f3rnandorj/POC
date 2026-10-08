import { Image } from "react-native";

import type { Collection } from "@domain";
import { motion } from "@theme";

import { Box } from "../Box/Box";
import { PressableBox } from "../PressableBox/PressableBox";
import { Text } from "../Text/Text";

interface CollectionCardProps {
  collection: Collection;
  onPress: (handle: string) => void;
  variant?: "row" | "tile";
}

export function CollectionCard({
  collection,
  onPress,
  variant = "row",
}: CollectionCardProps) {
  if (variant === "tile") {
    return (
      <PressableBox
        width={TILE_WIDTH}
        gap="s8"
        entering={motion.cardEnter}
        accessibilityRole="button"
        accessibilityLabel={collection.title}
        onPress={() => onPress(collection.handle)}
      >
        <CollectionImage collection={collection} height={TILE_IMAGE_HEIGHT} />

        <Text variant="titleMedium" numberOfLines={2}>
          {collection.title}
        </Text>
      </PressableBox>
    );
  }

  return (
    <PressableBox
      flexDirection="row"
      alignItems="center"
      gap="s12"
      entering={motion.cardEnter}
      accessibilityRole="button"
      accessibilityLabel={collection.title}
      onPress={() => onPress(collection.handle)}
    >
      <Box width={ROW_IMAGE}>
        <CollectionImage collection={collection} height={ROW_IMAGE} />
      </Box>

      <Text variant="titleMedium" numberOfLines={2} style={FLEXIBLE}>
        {collection.title}
      </Text>
    </PressableBox>
  );
}

function CollectionImage({
  collection,
  height,
}: {
  collection: Collection;
  height: number;
}) {
  const { image } = collection;

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s4"
      overflow="hidden"
      height={height}
      width="100%"
    >
      {image && (
        <Image
          source={{ uri: image.url }}
          accessibilityLabel={image.altText ?? collection.title}
          resizeMode="cover"
          style={FILL}
        />
      )}
    </Box>
  );
}

const ROW_IMAGE = 72;
const TILE_WIDTH = 190;
const TILE_IMAGE_HEIGHT = 120;
const FILL = { width: "100%", height: "100%" } as const;
const FLEXIBLE = { flex: 1 } as const;
