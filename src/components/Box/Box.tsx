import type { ComponentProps } from "react";
import type { ViewProps } from "react-native";

import { createBox } from "@shopify/restyle";
import Animated, { type AnimatedProps } from "react-native-reanimated";

import type { Theme } from "@theme";

export const Box = createBox<Theme>();

export type BoxProps = ComponentProps<typeof Box>;

/** Restyle tokens on a Reanimated view: `entering`/`layout` without raw `style={{}}`. */
export const AnimatedBox = createBox<Theme, AnimatedProps<ViewProps>>(
  Animated.View,
);

export type AnimatedBoxProps = ComponentProps<typeof AnimatedBox>;
