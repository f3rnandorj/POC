import Config from "react-native-config";

import type { MerchantConfig } from "../merchantTypes";

/** Credentials come from the environment: the Storefront token never sits in a tracked file. */
export const northstar: MerchantConfig = {
  id: "northstar",
  credentials: {
    storeDomain: Config.NORTHSTAR_STORE_DOMAIN ?? "",
    storefrontToken: Config.NORTHSTAR_STOREFRONT_TOKEN ?? "",
    apiVersion: Config.SHOPIFY_API_VERSION ?? "",
  },
  theme: {},
  layout: {
    productRow: "double",
    collections: "horizontal",
    detail: "gallery",
  },
  // One key per screen, then one per area, in render order. A key left out renders nothing.
  screens: {
    productDetail: {
      badgeRow: [
        {
          id: "badge",
          kind: "badge",
          source: {
            from: "metafield",
            namespace: "custom",
            key: "badge",
            as: "text",
          },
        },
        {
          id: "winter",
          kind: "badge",
          label: "WINTER COLLECTION",
          source: {
            from: "metafield",
            namespace: "custom",
            key: "is_winter_collection",
            as: "boolean",
          },
        },
      ],
      underPrice: [
        {
          id: "material",
          kind: "textLine",
          source: {
            from: "metafield",
            namespace: "custom",
            key: "material",
            as: "text",
          },
        },
        {
          id: "promotion",
          kind: "textLine",
          source: {
            from: "metafield",
            namespace: "custom",
            key: "promotion_text",
            as: "text",
          },
        },
      ],
      belowDescription: [
        {
          id: "care",
          kind: "labelValueSection",
          label: "How to care",
          source: {
            from: "metafield",
            namespace: "custom",
            key: "care_instructions",
            as: "json",
          },
          fields: [
            { key: "washing", label: "Washing" },
            { key: "drying", label: "Drying" },
          ],
        },
      ],
    },
    home: {
      productRow: "Products",
      footer: {
        id: "story",
        kind: "story",
        source: {
          from: "metaobject",
          type: "brand_story",
          fields: { title: "title", body: "description", image: "image" },
        },
      },
    },
  },
};
