import type { ReactNode } from "react";
import { Modal, Pressable } from "react-native";

import { motion } from "@theme";

import { AnimatedBox, Box } from "../Box/Box";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** The app's one dialog chrome: scrim, card and the Android back gesture, in a single place. */
export function Dialog({ isOpen, onClose, children }: DialogProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Box flex={1} justifyContent="center" padding="s24">
        {/* The scrim is the merchant's own background, so the dialog reads as the app receding. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={BACKDROP}
          onPress={onClose}
        >
          <Box flex={1} backgroundColor="background" opacity={0.94} />
        </Pressable>

        <AnimatedBox
          entering={motion.cardEnter}
          backgroundColor="surface"
          borderRadius="s4"
          borderWidth={1}
          borderColor="border"
          padding="s24"
          gap="s24"
        >
          {children}
        </AnimatedBox>
      </Box>
    </Modal>
  );
}

const BACKDROP = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;
