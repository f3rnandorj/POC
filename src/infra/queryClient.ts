import { QueryClient } from "@tanstack/react-query";

/** A Storefront 4xx will not succeed on a retry; 10s stale keeps list → detail off the network. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    },
  },
});
