declare module "react-native-config" {
  /** One key pair per merchant, prefixed with its `id`. Merges into `types/env.d.ts`. */
  export interface NativeConfig {
    NORTHSTAR_STORE_DOMAIN?: string;
    NORTHSTAR_STOREFRONT_TOKEN?: string;

    ATLAS_STORE_DOMAIN?: string;
    ATLAS_STOREFRONT_TOKEN?: string;
  }
}
