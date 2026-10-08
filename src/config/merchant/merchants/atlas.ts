import Config from "react-native-config";

import type { MerchantConfig } from "../merchantTypes";

/** A fictional second merchant, declared to exercise every axis of variation at once. */
export const atlas: MerchantConfig = {
  id: "atlas",
  credentials: {
    storeDomain: Config.ATLAS_STORE_DOMAIN ?? "",
    storefrontToken: Config.ATLAS_STOREFRONT_TOKEN ?? "",
    apiVersion: Config.SHOPIFY_API_VERSION ?? "",
    storePassword: Config.ATLAS_STORE_PASSWORD,
  },
  theme: {
    primaryColor: "#F04E23",
    background: "#FFF8F0",
    surface: "#F7E3CE",
    text: "#1C1814",
    textMuted: "#6B6054",
    border: "#E8D5BE",
  },
  metaobjectSources: {
    linenJourney: {
      type: "linen_journey",
      fields: { title: "heading", body: "story" },
    },
  },
  // No `belowDescription` and no `image`: the absent case lives in the config, not in a flag.
  screens: {
    home: {
      mainProductRowTitle: "Main products",
      layout: {
        mainProductRow: "carousel",
        collections: "inline",
      },
    },
    productDetail: {
      layout: {
        media: "gallery",
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
        ],
        textLines: [
          {
            id: "fabric",
            kind: "textLine",
            source: {
              from: "metafield",
              namespace: "custom",
              key: "fabric_type",
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
        aboveDescription: [
          {
            id: "fit",
            kind: "labelValueSection",
            label: "Fit guide",
            source: {
              from: "metafield",
              namespace: "custom",
              key: "fit_guide",
              as: "json",
            },
            fields: [
              { key: "cut", label: "Cut" },
              { key: "length", label: "Length" },
            ],
          },
          {
            id: "care",
            kind: "labelValueSection",
            label: "Care guide",
            source: {
              from: "metafield",
              namespace: "custom",
              key: "care_instructions",
              as: "json",
            },
            fields: [
              { key: "washing", label: "Wash" },
              { key: "drying", label: "Dry" },
            ],
          },
        ],
      },
      metaobjects: {
        footer: [
          {
            id: "detailStory",
            kind: "story",
            source: { from: "metaobject", ref: "linenJourney" },
          },
        ],
      },
    },
  },
};
