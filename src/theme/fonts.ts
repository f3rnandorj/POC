/**
 * PostScript names of the linked faces (`src/assets/fonts`, wired by `react-native-asset`).
 * Weight is selected by picking the face, not by `fontWeight` — RN would otherwise
 * synthesize a faux bold on Android instead of using Inter-Bold.
 */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  bold: 'Inter-Bold',
} as const;
