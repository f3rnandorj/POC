import { createTheme } from '@shopify/restyle';

import { merchantConfig } from '@config';

import { colors } from './colors';
import { pickContrastText } from './contrast';
import { textVariants } from './textVariants';

// The accent is the only merchant-overridable token (design.md). `accentText` is not a second
// override — it is derived, so a merchant brand color can never produce an unreadable label.
const accent = merchantConfig.theme.primaryColor ?? colors.accent;

export const theme = createTheme({
  colors: {
    ...colors,
    accent,
    accentText: pickContrastText(accent),
  },
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
