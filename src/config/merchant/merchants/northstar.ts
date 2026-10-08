import Config from "react-native-config";

import type { MerchantConfig } from "../merchantTypes";

export const northstar: MerchantConfig = {
  id: "northstar",
  credentials: {
    storeDomain: Config.NORTHSTAR_STORE_DOMAIN ?? "",
    storefrontToken: Config.NORTHSTAR_STOREFRONT_TOKEN ?? "",
    apiVersion: Config.SHOPIFY_API_VERSION ?? "",
    storePassword: Config.NORTHSTAR_STORE_PASSWORD,
  },
  theme: {},
  metaobjectSources: {
    brandStory: {
      type: "brand_story",
      fields: { title: "title", body: "description", image: "image" },
    },
  },
  screens: {
    home: {
      layout: {
        mainProductRow: "double",
        collections: "horizontal",
      },
      mainProductRowTitle: "Products",
      metaobjects: {
        footer: [
          {
            id: "homeStory",
            kind: "story",
            source: { from: "metaobject", ref: "brandStory" },
          },
        ],
      },
    },
    productDetail: {
      layout: {
        media: "filmstrip",
      },
      metafields: {
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
        textLines: [
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
    },
  },
};
