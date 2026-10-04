import type { ProductPrice } from "@domain";

/** Shopify returns money as a string (`"299.0"`) so the value never loses precision. */
export function formatPrice({ amount, currencyCode }: ProductPrice): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "";
  }

  // Whole amounts read better without cents on a card ("$299"); a fraction keeps both digits.
  const fractionDigits = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
