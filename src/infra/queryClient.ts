import { QueryClient } from '@tanstack/react-query';

/**
 * In-memory only — no persisted cache (quick-rule: the POC refetches on a cold start).
 * `retry: 1` because a Storefront 4xx (bad token, unknown metafield identifier) will not
 * succeed on a retry, and a 10s stale window keeps list → detail navigation off the network.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    },
  },
});
