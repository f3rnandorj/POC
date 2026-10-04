/**
 * Split out of `theme.ts` for the same reason as `colors.ts`: a module needing a raw token
 * (`screenGutter`) must not pull in a theme built for whichever merchant is active.
 */
export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s24: 24,
  s32: 32,
  // The gutter negated, for a row that scrolls to the device edge. Never a free negative
  // scale — only `s16` has one.
  sNegative16: -16,
} as const;
