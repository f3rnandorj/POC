import type { ProductPrice } from '@domain';

/**
 * Shopify returns money as a string (`"299.0"`) so the value never loses precision in
 * transit. Formatting happens here, at render time — never in the adapter.
 */
export function formatPrice({ amount, currencyCode }: ProductPrice): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return '';
  }

  // Whole amounts read better without the cents on a product card ("$299", not
  // "$299.00"); anything with a fraction keeps both digits.
  const fractionDigits = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
