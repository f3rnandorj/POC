import type { ResolvedBlock } from "@domain";

import type { BoxProps } from "../Box/Box";
import { Box } from "../Box/Box";
import { ProductBadge } from "../ProductBadge/ProductBadge";
import { ProductSection } from "../ProductSection/ProductSection";
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

function renderBlock(block: ResolvedBlock) {
  switch (block.kind) {
    case "badge":
      return <ProductBadge key={block.id} text={block.text} />;

    case "textLine":
      return (
        <Text key={block.id} variant="body" color="textMuted">
          {block.text}
        </Text>
      );

    case "labelValueSection":
      return (
        <ProductSection
          key={block.id}
          title={block.title}
          items={block.items}
        />
      );
  }
}
