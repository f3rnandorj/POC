import { DarkTheme, NavigationContainer } from "@react-navigation/native";

import { Box } from "@components";
import type { Theme } from "@theme";
import { useAppTheme } from "@theme";

import { AppStack } from "./AppStack";

export function Router() {
  const { colors } = useAppTheme();

  // The Box is what the native stack animates *over*: react-native-screens hands the incoming
  // screen its first frames before React has painted it, and whatever is behind shows through.
  // With nothing painting here that is the Android window background — white on a light-mode
  // device — which is the flash on every push. The merchant's background cannot live in
  // `styles.xml` because it is chosen at runtime, so it is painted here instead.
  return (
    <Box flex={1} backgroundColor="background">
      <NavigationContainer theme={navigationTheme(colors)}>
        <AppStack />
      </NavigationContainer>
    </Box>
  );
}

/** Overridden so the gap between screens during a push is the app background, not RN's own. */
function navigationTheme(colors: Theme["colors"]) {
  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };
}
