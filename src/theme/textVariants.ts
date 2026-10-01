import type { TextStyle } from 'react-native';

import type { ColorToken } from './colors';

/**
 * Every variant carries its own color token, and `defaults` carries one too — a `Text`
 * with no explicit color must still be readable on the near-black background.
 * Uppercase is a variant (`textTransform`), never `.toUpperCase()` at the call site.
 */
export const textVariants = {
  defaults: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: 'text',
  },
  displayLarge: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: 'text',
  },
  titleMedium: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'text',
  },
  priceLarge: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: 'text',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: 'text',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'textMuted',
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'accentText',
  },
} satisfies Record<string, Omit<TextStyle, 'color'> & { color: ColorToken }>;
