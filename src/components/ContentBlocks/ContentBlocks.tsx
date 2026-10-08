import type { ResolvedBlock } from "@domain";

import type { BoxProps } from "../Box/Box";
import { Box } from "../Box/Box";
import { ProductBadge } from "../ProductBadge/ProductBadge";
import { ProductSection } from "../ProductSection/ProductSection";
import { StoryCard } from "../StoryCard/StoryCard";
import { Text } from "../Text/Text";

interface ContentBlocksProps {
  blocks?: ResolvedBlock[];
  direction?: BoxProps["flexDirection"];
  gap?: BoxProps["gap"];
}

export function ContentBlocks({
  blocks,
  direction = "column",
  gap = "s12",
}: ContentBlocksProps) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <Box
      flexDirection={direction}
      // Wrapping a column would let a tall block jump sideways.
      flexWrap={direction === "row" ? "wrap" : undefined}
      gap={gap}
    >
      {blocks.map(renderBlock)}
    </Box>
  );
}

/**
 * Keyed by id *and* position: one declared block can resolve to several rendered ones — a story
 * block draws a section per metaobject entry — so the id alone is not unique inside an area.
 */
function renderBlock(block: ResolvedBlock, index: number) {
  const key = `${block.id}:${index}`;

  switch (block.kind) {
    case "badge":
      return <ProductBadge key={key} text={block.text} />;

    case "textLine":
      return (
        <Text key={key} variant="body" color="textMuted">
          {block.text}
        </Text>
      );

    case "labelValueSection":
      return (
        <ProductSection key={key} title={block.title} items={block.items} />
      );

    case "story":
      return (
        <StoryCard
          key={key}
          title={block.title}
          body={block.body}
          image={block.image}
        />
      );
  }
}
