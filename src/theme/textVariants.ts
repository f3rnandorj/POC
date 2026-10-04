import type { TextStyle } from "react-native";

import type { ColorToken } from "./colors";
import { fonts } from "./fonts";

/** Every variant carries a color token, `defaults` included, so no `Text` renders unstyled. */
export const textVariants = {
  defaults: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "text",
  },
  displayLarge: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: "text",
  },
  titleMedium: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "text",
  },
  priceLarge: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 28,
    fontVariant: ["tabular-nums"],
    color: "text",
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "text",
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: "textMuted",
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "accentText",
  },
} satisfies Record<string, Omit<TextStyle, "color"> & { color: ColorToken }>;
