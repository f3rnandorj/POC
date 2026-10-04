import { palette } from "./palette";

/** Split out of `theme.ts` so `textVariants.ts` can type its `color` against the real tokens. */
export const colors = {
  background: palette.ink,
  surface: palette.carbon,
  text: palette.chalk,
  textMuted: palette.ash,
  border: palette.graphite,
  accent: palette.volt,
  accentText: palette.ink,
  success: palette.mint,
  danger: palette.ember,
  transparent: palette.transparent,
};

export type ColorToken = keyof typeof colors;
