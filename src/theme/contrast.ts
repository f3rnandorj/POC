import { palette } from "./palette";

/** WCAG: a background above this relative luminance reads better with dark copy on it. */
const LUMINANCE_THRESHOLD = 0.179;

/** A merchant may override `accent` with any brand color, so its label color is derived. */
export function pickContrastText(backgroundHex: string): string {
  return isLight(backgroundHex) ? palette.ink : palette.chalk;
}

export function isLight(hex: string): boolean {
  return relativeLuminance(hex) > LUMINANCE_THRESHOLD;
}

/** WCAG contrast ratio, 1:1 to 21:1. */
export function contrastRatio(
  foregroundHex: string,
  backgroundHex: string,
): number {
  const a = relativeLuminance(foregroundHex);
  const b = relativeLuminance(backgroundHex);
  const [light, dark] = a > b ? [a, b] : [b, a];

  return (light + 0.05) / (dark + 0.05);
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = toChannels(hex);

  return (
    0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue)
  );
}

export function toChannels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map(character => character + character)
          .join("")
      : value;

  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function toLinear(channel: number): number {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}
