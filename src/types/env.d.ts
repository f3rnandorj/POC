declare module "react-native-config" {
  /** Read at build time: a new key needs a rebuild, not a reload. */
  export interface NativeConfig {
    SHOPIFY_API_VERSION?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
