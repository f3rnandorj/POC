import { useTheme } from "@shopify/restyle";

import type { Theme } from "./theme";

export function useAppTheme() {
  return useTheme<Theme>();
}
