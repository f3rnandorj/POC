import type { ReactNode } from "react";
import { ScrollView } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing as spacingTokens, useAppTheme } from "@theme";

import { BackControl } from "../BackControl/BackControl";
import type { BoxProps } from "../Box/Box";
import { Box } from "../Box/Box";
import { Text } from "../Text/Text";

export interface ScreenProps extends BoxProps {
  children: ReactNode;
  /** Off for a screen whose content is a `FlatList` — two scrollers on one axis fight. */
  scrollable?: boolean;
  /** A screen bringing its own list spreads `screenGutter` into it instead. */
  gutter?: boolean;
  title?: string;
  eyebrow?: string;
  /** A control on the title row, right-aligned. */
  headerRight?: ReactNode;
  onGoBack?: () => void;
  floatingBack?: boolean;
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
  ...boxProps
}: ScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { spacing } = useAppTheme();

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

      <ScreenTitle
        title={title}
        eyebrow={eyebrow}
        gutter={gutter}
        headerRight={headerRight}
      />

      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: bottom + spacing.s24,
            paddingHorizontal: gutter ? spacing.s16 : undefined,
          }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
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
  if (!title && !eyebrow && !headerRight) {
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

      {headerRight}
    </Box>
  );
}

/**
 * On iOS a scroller clips to its frame, so a row bleeding past the gutter
 * (`marginHorizontal="sNegative16"`) only survives when the gutter is padding *inside* it.
 */
export const screenGutter = {
  paddingHorizontal: spacingTokens.s16,
} as const;
