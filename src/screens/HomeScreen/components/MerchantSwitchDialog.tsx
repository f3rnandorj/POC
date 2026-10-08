import { Box, Dialog, PressableBox, Text } from "@components";
import type { MerchantId } from "@config";
import { merchantIds } from "@config";

interface MerchantSwitchDialogProps {
  isOpen: boolean;
  activeId: MerchantId;
  error?: string;
  onSelect: (merchantId: MerchantId) => void;
  onClose: () => void;
}

export function MerchantSwitchDialog({
  isOpen,
  activeId,
  error,
  onSelect,
  onClose,
}: MerchantSwitchDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <Box gap="s12">
        <Text variant="titleMedium" color="textMuted">
          Demo only
        </Text>

        <Text variant="displayLarge">Two stores, one build</Text>

        <Text variant="body" color="textMuted">
          No real storefront app has this — a build talks to one merchant and
          never shows one in the interface. It is here so you can watch the same
          screens and the same components draw another store: its own catalog,
          palette, layout and content.
        </Text>
      </Box>

      <Box gap="s8">
        {merchantIds.map(merchantId => (
          <MerchantOption
            key={merchantId}
            merchantId={merchantId}
            isActive={merchantId === activeId}
            onSelect={onSelect}
          />
        ))}

        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : (
          <Text variant="caption">Picking a store reopens the app on it.</Text>
        )}
      </Box>

      <PressableBox
        accessibilityRole="button"
        alignItems="center"
        paddingVertical="s8"
        onPress={onClose}
      >
        <Text variant="titleMedium" color="textMuted">
          Close
        </Text>
      </PressableBox>
    </Dialog>
  );
}

interface MerchantOptionProps {
  merchantId: MerchantId;
  isActive: boolean;
  onSelect: (merchantId: MerchantId) => void;
}

/** `titleMedium` already uppercases, so the id is passed as it is declared. */
function MerchantOption({
  merchantId,
  isActive,
  onSelect,
}: MerchantOptionProps) {
  return (
    <PressableBox
      backgroundColor={isActive ? "background" : "accent"}
      borderWidth={1}
      borderColor={isActive ? "border" : "accent"}
      borderRadius="s2"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="s16"
      paddingHorizontal="s16"
      gap="s12"
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={() => onSelect(merchantId)}
    >
      <Text variant="titleMedium" color={isActive ? "textMuted" : "accentText"}>
        {merchantId}
      </Text>

      {isActive ? (
        <Text variant="badge" color="textMuted">
          Current
        </Text>
      ) : null}
    </PressableBox>
  );
}
