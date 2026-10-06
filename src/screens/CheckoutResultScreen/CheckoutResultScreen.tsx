import { useEffect } from "react";

import { Box, Button, Screen, Text } from "@components";
import { clearActiveCart } from "@domain";
import { QueryKeys, queryClient } from "@infra";
import type { AppScreenProps } from "@routes";

/**
 * The end of the buying flow. What it shows came from the checkout, not from local state — the
 * cart it was built from is gone by the time this renders.
 */
export function CheckoutResultScreen({
  route,
  navigation,
}: AppScreenProps<"CheckoutResult">) {
  const { reference } = route.params;

  // Shopify has turned the cart into an order, so the app's copy of it is stale by definition.
  useEffect(() => {
    clearActiveCart();
    queryClient.removeQueries({ queryKey: [QueryKeys.Cart] });
  }, []);

  return (
    <Screen cartAction={false}>
      <Box flex={1} justifyContent="center" gap="s12" paddingHorizontal="s16">
        <Text variant="titleMedium" color="success">
          Order placed
        </Text>

        <Text variant="displayLarge">Thank you</Text>

        {/* Absent reference renders nothing — no dash, no placeholder. */}
        {reference ? <Text variant="priceLarge">{reference}</Text> : null}

        <Text variant="body" color="textMuted">
          This was a test payment on a development store: nothing was charged
          and nothing ships. The order is in the store's admin, flagged as a
          test.
        </Text>

        <Box flexDirection="row" marginTop="s16">
          <Button
            label="Back to shop"
            onPress={() => navigation.popTo("Home")}
          />
        </Box>
      </Box>
    </Screen>
  );
}
