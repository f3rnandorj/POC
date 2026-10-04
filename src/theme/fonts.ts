/**
 * PostScript names of the linked faces. Weight is selected by picking the face, never by
 * `fontWeight` — RN would synthesize a faux bold on Android instead of using Inter-Bold.
 */
export const fonts = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  bold: "Inter-Bold",
} as const;
