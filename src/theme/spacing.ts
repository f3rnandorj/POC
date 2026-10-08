/** Split out of `theme.ts` so a module needing a raw token pulls in no merchant theme. */
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
