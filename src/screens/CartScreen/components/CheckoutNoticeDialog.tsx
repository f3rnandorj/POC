import { Box, Button, Dialog, Text } from "@components";

interface CheckoutNoticeDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onClose: () => void;
}

/**
 * The only place the person holding this build learns the payment is simulated. App copy, not
 * merchant copy: dev mode is a property of the build.
 */
export function CheckoutNoticeDialog({
  isOpen,
  onContinue,
  onClose,
}: CheckoutNoticeDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <Box gap="s12">
        <Text variant="titleMedium" color="textMuted">
          Dev mode
        </Text>

        <Text variant="displayLarge">Test checkout</Text>

        <Text variant="body" color="textMuted">
          The next screen is Shopify's own checkout and the order it creates is
          real, but the payment provider is a test one: nothing is charged and
          nothing ships.
        </Text>
      </Box>

      <Box gap="s8">
        <Text variant="titleMedium">Card number</Text>

        {TEST_CARDS.map(card => (
          <Box
            key={card.number}
            flexDirection="row"
            justifyContent="space-between"
            gap="s12"
          >
            <Text variant="body">{card.number}</Text>
            <Text variant="body" color="textMuted">
              {card.result}
            </Text>
          </Box>
        ))}

        <Text variant="caption">
          Any future expiry date and any 3-digit security code.
        </Text>
      </Box>

      <Box flexDirection="row" gap="s8">
        <Button variant="outline" label="Cancel" onPress={onClose} />
        <Button label="Continue" onPress={onContinue} />
      </Box>
    </Dialog>
  );
}

/** Shopify's test payment gateway reads the card number as the outcome it should simulate. */
const TEST_CARDS = [
  { number: "1", result: "approved" },
  { number: "2", result: "declined" },
  { number: "3", result: "gateway failure" },
];
