import type { ComponentProps } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, type PressableProps } from "react-native";

import { createBox } from "@shopify/restyle";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedProps,
} from "react-native-reanimated";

import type { Theme } from "@theme";

import { AnimatedBox } from "../Box/Box";

/**
 * `AnimatedProps` widens every prop to "or a shared value", which makes the press handlers
 * uncallable — they come back from `PressableProps` as plain functions.
 */
export type PressableBoxProps = Omit<
  ComponentProps<typeof AnimatedPressable>,
  "onPressIn" | "onPressOut"
> &
  Pick<PressableProps, "onPressIn" | "onPressOut">;

/**
 * Every tappable surface routes through here, so press feedback lives here and nowhere else —
 * a product card, a variant chip and the back control all dip by the same amount.
 */
export function PressableBox({
  onPressIn,
  onPressOut,
  style,
  entering,
  exiting,
  layout,
  ...boxProps
}: PressableBoxProps) {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * PRESS_DEPTH }],
  }));

  const pressable = (
    <AnimatedPressable
      {...boxProps}
      onPressIn={(event: GestureResponderEvent) => {
        pressed.value = withTiming(1, PRESS_IN);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        pressed.value = withTiming(0, PRESS_OUT);
        onPressOut?.(event);
      }}
      style={[pressStyle, style]}
    />
  );

  // An entering/layout animation writes `transform` too, so on the same view it overwrites the
  // press scale. Reanimated's own answer is a wrapper, applied here so no caller has to know.
  if (!entering && !exiting && !layout) {
    return pressable;
  }

  return (
    <AnimatedBox
      entering={entering}
      exiting={exiting}
      layout={layout}
      flex={boxProps.flex}
    >
      {pressable}
    </AnimatedBox>
  );
}

const AnimatedPressable = createBox<Theme, AnimatedProps<PressableProps>>(
  Animated.createAnimatedComponent(Pressable),
);

/** 3%: reads as a press on a 150px card without looking like a bounce. */
const PRESS_DEPTH = 0.03;
/** Asymmetric on purpose — the dip is instant, the release settles. */
const PRESS_IN = { duration: 90 };
const PRESS_OUT = { duration: 140 };
