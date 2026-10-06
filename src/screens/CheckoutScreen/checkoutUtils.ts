/** Pure helpers for the checkout WebView — kept out of the screen (quick-rule #14). */

export interface CheckoutMessage {
  isCompleted: boolean;
  /** Only ever this app's own reading of the order number; never raw page data. */
  reference?: string;
}

export function passwordUrl(storeDomain: string): string {
  return `https://${storeDomain}/password`;
}

/**
 * Shopify's password page is a plain form. Filling and submitting it is what the buyer would do
 * by hand, and it is the only thing that opens the checkout on a development store.
 */
export function passwordScript(password?: string): string {
  return `
    (function () {
      var form = document.querySelector('form[action*="/password"]');
      var field = form && form.querySelector('input[type="password"]');
      if (form && field) {
        field.value = ${JSON.stringify(password ?? "")};
        form.submit();
      }
    })();
    true;
  `;
}

/**
 * Watches for the order status page instead of running once: Shopify's checkout is a single
 * document, so reaching "thank you" fires no page load and no second injection.
 *
 * The order number is read from the page because the Storefront API has no orders — it is the
 * buyer's reference, and an absent one simply renders nothing.
 */
export function completionScript(): string {
  return `
    (function () {
      if (window.__fuegoCheckoutWatch) { return; }
      window.__fuegoCheckoutWatch = true;

      var sent = false;
      // ponytail: polling, because the page gives no event. 500ms is below noticing.
      setInterval(function () {
        if (sent || !${COMPLETED_PATTERN_SOURCE}.test(window.location.href)) { return; }
        sent = true;
        var match = document.body.innerText.match(/#\\d{3,}/);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          source: ${JSON.stringify(MESSAGE_SOURCE)},
          reference: match ? match[0] : null,
        }));
      }, 500);
    })();
    true;
  `;
}

/** True only on Shopify's order status page — where a completion may legitimately be claimed. */
export function isCompletionUrl(url: string): boolean {
  return COMPLETED_PATTERN.test(url);
}

/**
 * The checkout page posts messages of its own — `{"checkout_completed":true}` among them — so a
 * message is read, never trusted: anything unrecognised is ignored, and the reference is only
 * ever taken from this app's own payload.
 *
 * A payload can still be forged by whatever runs in the page, so the caller pairs this with
 * `isCompletionUrl`: a completion claimed from anywhere but the order status page is noise.
 */
export function readCheckoutMessage(data: string): CheckoutMessage {
  const parsed = parseJson(data);

  if (!parsed) {
    return { isCompleted: false };
  }

  if (parsed.source === MESSAGE_SOURCE) {
    return { isCompleted: true, reference: toReference(parsed.reference) };
  }

  return { isCompleted: parsed.checkout_completed === true };
}

/**
 * Only the merchant's own host and Shopify's: the checkout pulls its card field and its assets
 * from Shopify-owned domains, and blocking those would break the page it is trying to show.
 *
 * Parsed by hand rather than with `URL`, whose React Native polyfill is partial, and strictly:
 * the authority must be hostname characters and an optional port, so `user@evil.com` and
 * `evil.com\\.shopify.com` — which a browser resolves to `evil.com` — never reach the comparison.
 * Suffixes are dot-anchored for the same reason `shop.app` is an exact host: without the dot,
 * `evilshop.app` would pass.
 */
export function isStoreUrl(url: string, storeDomain: string): boolean {
  const host = url.match(HOST_PATTERN)?.[1]?.toLowerCase().replace(/\.$/, "");

  if (!host) {
    return false;
  }

  return (
    host === storeDomain.toLowerCase() ||
    ALLOWED_HOSTS.has(host) ||
    ALLOWED_SUFFIXES.some(suffix => host.endsWith(suffix))
  );
}

function parseJson(data: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(data);

    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/** An order number or nothing — never a free string off the page. */
function toReference(value: unknown): string | undefined {
  return typeof value === "string" && /^#\d{3,}$/.test(value)
    ? value
    : undefined;
}

const MESSAGE_SOURCE = "fuego-checkout";
/** Written as source because it is injected into the page, not evaluated here. */
const COMPLETED_PATTERN_SOURCE = "/(thank[_-]you|\\/orders\\/)/";
const COMPLETED_PATTERN = /thank[_-]you|\/orders\//;
/** HTTPS only, no credentials, no backslash: anything else fails closed. */
const HOST_PATTERN = /^https:\/\/([a-z0-9.-]+)(?::\d+)?(?:[/?#]|$)/i;
/** Shop Pay, by exact host and below it — never as a bare suffix. */
const ALLOWED_HOSTS = new Set(["shop.app"]);
/**
 * Shopify's own infrastructure only. `.myshopify.com` is deliberately absent: anyone can create a
 * store there, and the merchant's own domain is already matched exactly.
 */
const ALLOWED_SUFFIXES = [
  ".shopify.com",
  ".shopifyinc.com",
  ".shopifycdn.com",
  ".shop.app",
];
