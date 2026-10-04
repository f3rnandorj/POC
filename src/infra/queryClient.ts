import { QueryClient } from "@tanstack/react-query";

/**
 * `retry: 1` because a Storefront 4xx (bad token, unknown identifier) will not succeed on a
 * retry; the 10s stale window keeps list → detail navigation off the network.
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
