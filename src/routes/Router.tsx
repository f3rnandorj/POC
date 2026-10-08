import { DarkTheme, NavigationContainer } from "@react-navigation/native";

import { Box } from "@components";
import type { Theme } from "@theme";
import { useAppTheme } from "@theme";

import { AppStack } from "./AppStack";

export function Router() {
  const { colors } = useAppTheme();

  // react-native-screens shows the incoming screen's first frames before React paints it, so
  // whatever is behind bleeds through — the Android window background, white, on every push.
  // The merchant's background is runtime-chosen, so it cannot live in `styles.xml`.
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
