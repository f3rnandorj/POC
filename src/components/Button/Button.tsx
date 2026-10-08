import { PressableBox } from "../PressableBox/PressableBox";
import { Text } from "../Text/Text";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  accessibilityLabel?: string;
}

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
