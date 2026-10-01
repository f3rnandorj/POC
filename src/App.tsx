import { StatusBar } from 'react-native';

import { ThemeProvider } from '@shopify/restyle';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@infra';
import { Router } from '@routes';
import { theme } from '@theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <Router />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
