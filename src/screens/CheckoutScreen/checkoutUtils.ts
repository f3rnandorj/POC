export interface CheckoutMessage {
  isCompleted: boolean;
  /** Only ever this app's own reading of the order number; never raw page data. */
  reference?: string;
}

export function passwordUrl(storeDomain: string): string {
  return `https://${storeDomain}/password`;
}

/** Submitting the form by script is the only way into a development store's checkout. */
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
 * Shopify's checkout is a single document, so reaching "thank you" fires no page load and no
 * second injection. The order number is read off the page because Storefront has no orders.
 */
export function completionScript(): string {
  return `
    (function () {
      if (window.__fuegoCheckoutWatch) { return; }
      window.__fuegoCheckoutWatch = true;

      // ponytail: polling, because the page gives no event. 500ms is below noticing.
      // It keeps posting instead of firing once: the native side may still be judging the message
      // against the previous page, and a single shot would be lost for good.
      setInterval(function () {
        if (!${COMPLETED_PATTERN_SOURCE}.test(window.location.href)) { return; }
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

export function isCompletionUrl(url: string): boolean {
  return COMPLETED_PATTERN.test(url);
}

/**
 * Read, never trusted: the page posts messages of its own, and any payload can be forged by
 * whatever runs in it. Where it came from is the caller's check, against `nativeEvent.url`.
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
 * Parsed by hand — React Native's `URL` polyfill is partial — and strictly: the authority must
 * be hostname characters and an optional port, so `user@evil.com` and `evil.com\\.shopify.com`,
 * which a browser resolves to `evil.com`, never reach the comparison. Suffixes are dot-anchored
 * for the same reason `shop.app` is an exact host: without the dot, `evilshop.app` would pass.
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
