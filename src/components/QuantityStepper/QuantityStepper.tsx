import { Box } from "../Box/Box";
import { PressableBox } from "../PressableBox/PressableBox";
import { Text } from "../Text/Text";

export interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  /** The cart passes 0 — decrementing past the floor there is a removal. */
  min?: number;
  /** Absent when the merchant does not track this variant's inventory. */
  max?: number;
  disabled?: boolean;
  decreaseLabel?: string;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max,
  disabled = false,
  decreaseLabel = "Decrease quantity",
}: QuantityStepperProps) {
  const canDecrease = !disabled && quantity > min;
  const canIncrease = !disabled && (max === undefined || quantity < max);

  return (
    <Box flexDirection="row" alignItems="center" gap="s8">
      <StepperButton
        label="−"
        accessibilityLabel={decreaseLabel}
        disabled={!canDecrease}
        onPress={() => onChange(quantity - 1)}
      />

      {/* Fixed width: the count grows a digit and the row would otherwise squeeze the CTA. */}
      <Box minWidth={COUNT_WIDTH} alignItems="center">
        <Text variant="body">{quantity}</Text>
      </Box>

      <StepperButton
        label="+"
        accessibilityLabel="Increase quantity"
        disabled={!canIncrease}
        onPress={() => onChange(quantity + 1)}
      />
    </Box>
  );
}

interface StepperButtonProps {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}

function StepperButton({
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: StepperButtonProps) {
  return (
    <PressableBox
      backgroundColor="surface"
      borderRadius="s2"
      width={STEP}
      height={STEP}
      alignItems="center"
      justifyContent="center"
      opacity={disabled ? 0.4 : 1}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <Text variant="body">{label}</Text>
    </PressableBox>
  );
}

const STEP = 32;
/** Three digits of the `body` variant — not layout a token describes. */
const COUNT_WIDTH = 28;
