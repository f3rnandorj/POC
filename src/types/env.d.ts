declare module 'react-native-config' {
  /**
   * Keys mirror `.env.example`. Values are strings or `undefined` — a missing key is a
   * misconfigured build, not a crash; the merchant config layer decides what to do.
   */
  export interface NativeConfig {
    SHOPIFY_STORE_DOMAIN?: string;
    SHOPIFY_STOREFRONT_TOKEN?: string;
    SHOPIFY_API_VERSION?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
