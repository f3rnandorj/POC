import { createTheme } from "@shopify/restyle";

import { merchantConfig } from "@config";

import { colors } from "./colors";
import { contrastRatio, isLight, pickContrastText } from "./contrast";
import { palette } from "./palette";
import { spacing } from "./spacing";
import { textVariants } from "./textVariants";

/** Built per merchant, never at import: the app root rebuilds it when the store changes. */
export function buildTheme() {
  const merchant = merchantConfig();

  // One expression per token rather than a spread: a spread would silently accept a typo'd key
  // as a new token instead of failing.
  const brand = merchant.theme;
  const accent = brand.primaryColor ?? colors.accent;
  const background = brand.background ?? colors.background;
  const surface = brand.surface ?? colors.surface;
  const text = brand.text ?? colors.text;
  const textMuted = brand.textMuted ?? colors.textMuted;
  const border = brand.border ?? colors.border;

  // Derived, never overridable: the state colors follow the background a merchant chose.
  const onLight = isLight(background);

  const merchantColors: MerchantColors = {
    ...colors,
    accent,
    accentText: pickContrastText(accent),
    background,
    surface,
    text,
    textMuted,
    border,
    success: onLight ? palette.moss : palette.mint,
    danger: onLight ? palette.clay : palette.ember,
  };

  assertReadable(merchantColors, merchant.id);

  return createTheme({
    colors: merchantColors,
    spacing,
    borderRadii: {
      s2: 4,
      s4: 8,
    },
    // Elevation is contrast, not shadow — the scale stays empty on purpose (design.md).
    shadowVariants: {},
    breakpoints: {},
    textVariants,
  });
}

export type Theme = ReturnType<typeof buildTheme>;

/** The base tokens with merchant values: widened, since `palette` literals are `as const`. */
type MerchantColors = Record<keyof typeof colors, string>;

/** A bad palette fails by being invisible, so this throws in dev. Fixed colors included. */
function assertReadable(
  merchantColors: MerchantColors,
  merchantId: string,
): void {
  if (!__DEV__) {
    return;
  }

  const { text, textMuted, surface, background } = merchantColors;

  const pairs: [string, string, string, number][] = [
    ["text", text, background, 4.5],
    ["textMuted", textMuted, background, 4.5],
    ["text on surface", text, surface, 4.5],
    ["success", merchantColors.success, background, 3],
    ["danger", merchantColors.danger, background, 3],
  ];

  const failed = pairs
    .filter(
      ([, foreground, over, minimum]) =>
        contrastRatio(foreground, over) < minimum,
    )
    .map(
      ([name, foreground, over, minimum]) =>
        `${name} ${contrastRatio(foreground, over).toFixed(
          2,
        )}:1 (needs ${minimum}:1)`,
    );

  if (failed.length > 0) {
    throw new Error(
      `Merchant "${merchantId}" palette is unreadable — ${failed.join(
        ", ",
      )}. ` +
        `Fix the brand colors in config/merchant/merchants/${merchantId}.ts.`,
    );
  }
}
