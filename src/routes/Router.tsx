import { DarkTheme, NavigationContainer } from '@react-navigation/native';

import { theme } from '@theme';

import { AppStack } from './AppStack';

export function Router() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <AppStack />
    </NavigationContainer>
  );
}

/**
 * The navigator's own theme is overridden so the gap between screens during a push
 * is the app background, not React Navigation's default near-black.
 */
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.accent,
  },
};
