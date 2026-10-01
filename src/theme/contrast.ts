import { palette } from './palette';

/** WCAG: a background above this relative luminance reads better with dark copy on it. */
const LUMINANCE_THRESHOLD = 0.179;

/**
 * `accentText` sits on top of `accent`, and a merchant may override the accent with any brand
 * color. Deriving the label color from the accent's luminance is what keeps the CTA readable
 * instead of assuming every merchant ships a bright one (design.md, US-003 of PRD 008).
 */
export function pickContrastText(backgroundHex: string): string {
  return relativeLuminance(backgroundHex) > LUMINANCE_THRESHOLD ? palette.ink : palette.chalk;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = toChannels(hex);

  return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function toChannels(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map(character => character + character)
          .join('')
      : value;

  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function toLinear(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}
