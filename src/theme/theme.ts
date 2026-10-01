import { createTheme } from '@shopify/restyle';

import { colors } from './colors';
import { textVariants } from './textVariants';

export const theme = createTheme({
  colors,
  spacing: {
    s4: 4,
    s8: 8,
    s12: 12,
    s16: 16,
    s24: 24,
    s32: 32,
  },
  borderRadii: {
    s2: 4,
    s4: 8,
  },
  // Elevation is contrast, not shadow — the scale stays empty on purpose (design.md).
  shadowVariants: {},
  breakpoints: {},
  textVariants,
});

export type Theme = typeof theme;
