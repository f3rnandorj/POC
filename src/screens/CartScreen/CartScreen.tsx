import { useState } from "react";

import { Box, Button, Screen, Text } from "@components";
import {
  useCartGetDetail,
  useCartRemoveLine,
  useCartUpdateLine,
} from "@domain";
import type { AppScreenProps } from "@routes";
import { formatPrice } from "@utils";

import { CartLineRow } from "./components/CartLineRow";
import { CheckoutNoticeDialog } from "./components/CheckoutNoticeDialog";

export function CartScreen({ navigation }: AppScreenProps<"Cart">) {
  const { cart, isLoading, error, refetch } = useCartGetDetail();
  const { updateLine, isPending: isUpdating } = useCartUpdateLine();
  const { removeLine, isPending: isRemoving } = useCartRemoveLine();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const isBusy = isUpdating || isRemoving;
  const lines = cart?.lines ?? [];

  // `popTo`, never `push`: the detail is usually already below the cart, and bouncing between
  // the two would otherwise stack a new copy of each on every round trip.
  function openProduct(handle: string) {
    navigation.popTo("ProductDetail", { handle });
  }

  function openCheckout() {
    setIsNoticeOpen(false);
    navigation.navigate("Checkout");
  }

  return (
    <Screen
      scrollable
      cartAction={false}
      title="Cart"
      onGoBack={navigation.goBack}
      footer={
        lines.length > 0 && cart ? (
          <>
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="titleMedium" color="textMuted">
                Subtotal
              </Text>
              {/* Shopify's number, never a sum computed here. */}
              <Text variant="priceLarge">{formatPrice(cart.subtotal)}</Text>
            </Box>

            <Box flexDirection="row">
              <Button
                label="Checkout"
                disabled={isBusy}
                onPress={() => setIsNoticeOpen(true)}
              />
            </Box>
          </>
        ) : undefined
      }
    >
      <CartBody
        hasLines={lines.length > 0}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onBrowse={() => navigation.navigate("ProductList", {})}
      />

      {lines.map(line => (
        <Box key={line.id} borderBottomWidth={1} borderBottomColor="border">
          <CartLineRow
            line={line}
            isBusy={isBusy}
            onChangeQuantity={updateLine}
            onRemove={removeLine}
            onOpenProduct={openProduct}
          />
        </Box>
      ))}

      <CheckoutNoticeDialog
        isOpen={isNoticeOpen}
        onContinue={openCheckout}
        onClose={() => setIsNoticeOpen(false)}
      />
    </Screen>
  );
}

interface CartBodyProps {
  hasLines: boolean;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onBrowse: () => void;
}

function CartBody({
  hasLines,
  isLoading,
  error,
  onRetry,
  onBrowse,
}: CartBodyProps) {
  if (hasLines) {
    return null;
  }

  if (error) {
    return (
      <Box gap="s12" paddingTop="s24">
        <Text variant="titleMedium" color="danger">
          Something broke
        </Text>
        <Text variant="body" color="textMuted">
          {error instanceof Error
            ? error.message
            : "Could not reach the store."}
        </Text>
        <Box flexDirection="row">
          <Button label="Try again" onPress={onRetry} />
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Text variant="titleMedium" color="textMuted" marginTop="s24">
        Loading
      </Text>
    );
  }

  return (
    <Box gap="s12" paddingTop="s24">
      <Text variant="titleMedium" color="textMuted">
        Your cart is empty
      </Text>
      <Text variant="body" color="textMuted">
        Nothing added yet — the catalogue is one tap away.
      </Text>
      <Box flexDirection="row">
        <Button label="Browse products" onPress={onBrowse} />
      </Box>
    </Box>
  );
}
