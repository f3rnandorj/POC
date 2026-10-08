import { useState } from "react";

import { Box, PressableBox } from "@components";
import type { MerchantId } from "@config";
import {
  getActiveMerchantId,
  getMerchantConfig,
  setActiveMerchant,
} from "@config";
import { queryClient } from "@infra";

import { MerchantSwitchDialog } from "./MerchantSwitchDialog";

/** Demo-only: a real storefront build is bound to one merchant and ships no such control. */
export function MerchantSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();

  function open() {
    setError(undefined);
    setIsOpen(true);
  }

  function select(merchantId: MerchantId) {
    if (merchantId === getActiveMerchantId()) {
      setIsOpen(false);

      return;
    }

    try {
      // Validated before the switch: missing credentials would otherwise throw while the theme
      // is being built, which in a release build is a dead app rather than a message.
      getMerchantConfig(merchantId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This store is not configured.",
      );

      return;
    }

    // Query keys carry no merchant, so the previous store's catalog would be served from cache to
    // the new one — and `staleTime` would keep it there.
    queryClient.clear();
    setIsOpen(false);
    setActiveMerchant(merchantId);
  }

  return (
    <>
      <PressableBox
        accessibilityRole="button"
        accessibilityLabel="Switch demo store"
        backgroundColor="surface"
        borderRadius="s2"
        paddingVertical="s8"
        paddingHorizontal="s12"
        alignItems="center"
        gap="s4"
        onPress={open}
      >
        {DOTS.map(dot => (
          <Box
            key={dot}
            width={DOT_SIZE}
            height={DOT_SIZE}
            borderRadius="s2"
            backgroundColor="text"
          />
        ))}
      </PressableBox>

      <MerchantSwitchDialog
        isOpen={isOpen}
        activeId={getActiveMerchantId()}
        error={error}
        onSelect={select}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

const DOTS = [0, 1, 2];
/** Not a spacing token: it is the glyph, not layout. */
const DOT_SIZE = 4;
