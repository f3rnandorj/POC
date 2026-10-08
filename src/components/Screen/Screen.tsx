import type { ReactNode } from "react";
import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { ScrollView } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing as spacingTokens, useAppTheme } from "@theme";

import { BackControl } from "../BackControl/BackControl";
import type { BoxProps } from "../Box/Box";
import { Box } from "../Box/Box";
import { CartButton } from "../CartButton/CartButton";
import { Text } from "../Text/Text";

export interface ScreenProps extends BoxProps {
  children: ReactNode;
  /** Off for a screen whose content is a `FlatList` — two scrollers on one axis fight. */
  scrollable?: boolean;
  /** A screen bringing its own list spreads `screenGutter` into it instead. */
  gutter?: boolean;
  title?: string;
  eyebrow?: string;
  headerRight?: ReactNode;
  onGoBack?: () => void;
  floatingBack?: boolean;
  /** Off for the screens that are already the cart, or past it. */
  cartAction?: boolean;
  /** A CTA pinned over the scroller. Scrollable screens only — it needs a scroller to float on. */
  footer?: ReactNode;
}

export function Screen({
  children,
  scrollable = false,
  gutter = true,
  title,
  eyebrow,
  headerRight,
  onGoBack,
  floatingBack = false,
  cartAction = true,
  footer,
  ...boxProps
}: ScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { spacing } = useAppTheme();
  // Measured, never a constant: the safe area, the font scale and the label itself all move it.
  const [footerHeight, setFooterHeight] = useState(0);

  const content = (
    <Box flex={scrollable ? undefined : 1} {...boxProps}>
      {children}
    </Box>
  );

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      {onGoBack ? (
        <ScreenBack onPress={onGoBack} top={floatingBack ? top : undefined} />
      ) : null}

      {/* A screen whose first pixel is a photo has no header row to sit in, so it floats
          opposite the back control instead of forcing one. */}
      {cartAction && floatingBack ? (
        <Box
          position="absolute"
          right={0}
          zIndex={1}
          paddingHorizontal="s16"
          style={{ top: top + spacingTokens.s8 }}
        >
          <CartButton floating />
        </Box>
      ) : null}

      <ScreenTitle
        title={title}
        eyebrow={eyebrow}
        gutter={gutter}
        headerRight={
          <>
            {cartAction && !floatingBack ? <CartButton /> : null}
            {headerRight}
          </>
        }
      />

      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: bottom + spacing.s24 + footerHeight,
            paddingHorizontal: gutter ? spacing.s16 : undefined,
          }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}

      {footer ? (
        <ScreenFooter bottom={bottom} onMeasure={setFooterHeight}>
          {footer}
        </ScreenFooter>
      ) : null}
    </Box>
  );
}

interface ScreenFooterProps {
  children: ReactNode;
  bottom: number;
  onMeasure: (height: number) => void;
}

function ScreenFooter({ children, bottom, onMeasure }: ScreenFooterProps) {
  return (
    <Box
      position="absolute"
      left={0}
      right={0}
      bottom={0}
      backgroundColor="background"
      borderTopWidth={1}
      borderTopColor="border"
      paddingHorizontal="s16"
      paddingTop="s12"
      gap="s8"
      style={{ paddingBottom: bottom + spacingTokens.s12 }}
      onLayout={(event: LayoutChangeEvent) =>
        onMeasure(event.nativeEvent.layout.height)
      }
    >
      {children}
    </Box>
  );
}

function ScreenBack({ onPress, top }: { onPress: () => void; top?: number }) {
  if (top !== undefined) {
    return <BackControl top={top} onPress={onPress} />;
  }

  return (
    <Box paddingTop="s12">
      <BackControl onPress={onPress} />
    </Box>
  );
}

function ScreenTitle({
  title,
  eyebrow,
  gutter,
  headerRight,
}: Pick<ScreenProps, "title" | "eyebrow" | "gutter" | "headerRight">) {
  if (!title && !eyebrow) {
    return null;
  }

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={gutter ? "s16" : undefined}
      paddingVertical="s16"
      gap="s16"
    >
      {/* `flex` so a long title wraps instead of pushing the control off the screen. */}
      <Box flex={1} gap="s4">
        {eyebrow ? (
          <Text variant="titleMedium" color="textMuted">
            {eyebrow}
          </Text>
        ) : null}

        {title ? <Text variant="displayLarge">{title}</Text> : null}
      </Box>

      <Box flexDirection="row" alignItems="center" gap="s8">
        {headerRight}
      </Box>
    </Box>
  );
}

/** On iOS a scroller clips to its frame, so a bleeding row needs the gutter as inner padding. */
export const screenGutter = {
  paddingHorizontal: spacingTokens.s16,
} as const;
