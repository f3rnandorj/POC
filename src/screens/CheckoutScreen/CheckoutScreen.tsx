import { useState } from "react";

import type {
  WebViewMessageEvent,
  WebViewNavigation,
} from "react-native-webview";
import { WebView } from "react-native-webview";

import { Box, Button, Screen, Text } from "@components";
import { merchantConfig } from "@config";
import { useCartGetDetail } from "@domain";
import type { AppScreenProps } from "@routes";

import {
  completionScript,
  isCompletionUrl,
  isStoreUrl,
  passwordScript,
  passwordUrl,
  readCheckoutMessage,
} from "./checkoutUtils";

/**
 * Shopify's own checkout, in a WebView. The app never collects a card: everything from contact to
 * payment is Shopify's page, and the only thing read back is whether it finished.
 */
export function CheckoutScreen({ navigation }: AppScreenProps<"Checkout">) {
  const { cart } = useCartGetDetail();
  const { storeDomain, storePassword } = merchantConfig().credentials;
  // A development store answers a cookieless hit with its password page, so that form is
  // submitted first. An open store has no password declared and starts at the checkout.
  const [isUnlocked, setIsUnlocked] = useState(!storePassword);
  const [hasFailed, setHasFailed] = useState(false);
  // Where the WebView actually is, so a posted message is judged against the page that sent it.
  const [currentUrl, setCurrentUrl] = useState("");

  if (!cart) {
    return <CheckoutNotice onBack={navigation.goBack} />;
  }

  function onNavigate(event: WebViewNavigation) {
    setCurrentUrl(event.url);

    if (!isUnlocked && !event.loading && !event.url.includes("/password")) {
      setIsUnlocked(true);
    }
  }

  function onMessage(event: WebViewMessageEvent) {
    const message = readCheckoutMessage(event.nativeEvent.data);

    // The checkout chatters over this bridge, and anything running in the page can post to it.
    // A completion is only believed from the order status page itself.
    if (message.isCompleted && isCompletionUrl(currentUrl)) {
      navigation.replace("CheckoutResult", { reference: message.reference });
    }
  }

  return (
    <Screen title="Checkout" cartAction={false} onGoBack={navigation.goBack}>
      {hasFailed ? (
        <Box gap="s12" padding="s16">
          <Text variant="titleMedium" color="danger">
            Checkout did not load
          </Text>
          <Text variant="body" color="textMuted">
            The store did not answer. Your cart is untouched.
          </Text>
          <Box flexDirection="row">
            <Button label="Back to cart" onPress={navigation.goBack} />
          </Box>
        </Box>
      ) : (
        <WebView
          source={{
            uri: isUnlocked ? cart.checkoutUrl : passwordUrl(storeDomain),
          }}
          // Submits the password form on the way in, then watches for the order status page.
          injectedJavaScript={
            isUnlocked ? completionScript() : passwordScript(storePassword)
          }
          onNavigationStateChange={onNavigate}
          onMessage={onMessage}
          onError={() => setHasFailed(true)}
          onShouldStartLoadWithRequest={request =>
            isStoreUrl(request.url, storeDomain)
          }
          startInLoadingState
          sharedCookiesEnabled
          style={FILL}
        />
      )}
    </Screen>
  );
}

/** Reaching checkout without a cart means it was emptied or dropped while this screen opened. */
function CheckoutNotice({ onBack }: { onBack: () => void }) {
  return (
    <Box gap="s12" padding="s16">
      <Text variant="titleMedium" color="textMuted">
        Nothing to check out
      </Text>
      <Text variant="body" color="textMuted">
        This cart is empty.
      </Text>
      <Box flexDirection="row">
        <Button label="Back" onPress={onBack} />
      </Box>
    </Box>
  );
}

const FILL = { flex: 1 } as const;
