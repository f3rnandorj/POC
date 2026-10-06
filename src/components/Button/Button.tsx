import { PressableBox } from "../PressableBox/PressableBox";
import { Text } from "../Text/Text";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** `outline` is the secondary action standing next to a primary one. */
  variant?: "primary" | "outline";
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * The project's one button. Stretches to its container rather than self-aligning — a CTA spans
 * the gutter, and two of them side by side are two flexed boxes, not two widths.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <PressableBox
      flex={1}
      backgroundColor={isPrimary ? "accent" : "background"}
      borderWidth={isPrimary ? 0 : 1}
      borderColor="border"
      borderRadius="s2"
      paddingVertical="s16"
      paddingHorizontal="s24"
      alignItems="center"
      justifyContent="center"
      opacity={disabled ? 0.4 : 1}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
    >
      <Text variant="badge" color={isPrimary ? "accentText" : "text"}>
        {label}
      </Text>
    </PressableBox>
  );
}
