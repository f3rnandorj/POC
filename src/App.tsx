import { StatusBar } from "react-native";

import { ThemeProvider } from "@shopify/restyle";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useActiveMerchantId } from "@config";
import { queryClient } from "@infra";
import { Router } from "@routes";
import { buildTheme, isLight } from "@theme";

export default function App() {
  const merchantId = useActiveMerchantId();
  const theme = buildTheme();

  // `key`: the remount is what drops the navigation stack and every screen's local state, so
  // nothing from the previous store survives the switch.
  return (
    <ThemeProvider key={merchantId} theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          {/* Derived like `accentText`: a merchant on a light background needs dark glyphs. */}
          <StatusBar
            barStyle={
              isLight(theme.colors.background)
                ? "dark-content"
                : "light-content"
            }
          />
          <Router />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
