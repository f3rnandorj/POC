import { useEffect, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList, useWindowDimensions } from "react-native";

import { useReducedMotion } from "react-native-reanimated";

import { AnimatedBox, Box, ProductCard } from "@components";
import type { Product } from "@domain";
import { motion } from "@theme";

interface HomeProductCarouselProps {
  products: Product[];
  /** Pages on its own every `AUTO_SCROLL_MS`, until the first touch or a reduced-motion setting. */
  autoScroll?: boolean;
  onOpenProduct: (handle: string) => void;
}

/**
 * `layout.mainProductRow: "carousel"` — one product per page, full width, with dots. Same products
 * the other arrangements draw; the page is the device width, so the card carries the screen.
 */
export function HomeProductCarousel({
  products,
  autoScroll = false,
  onOpenProduct,
}: HomeProductCarouselProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Product>>(null);
  const [page, setPage] = useState(0);
  // A swipe takes the carousel over for good: a timer that resumes fights the hand on the screen.
  const [taken, setTaken] = useState(false);
  const reduceMotion = useReducedMotion();

  const isAuto = autoScroll && !taken && !reduceMotion && products.length > 1;

  useEffect(() => {
    if (!isAuto) {
      return;
    }

    // One timer per page rather than an interval: `page` also moves on a swipe, and a
    // rescheduled timeout restarts the dwell from wherever the carousel actually is.
    const timer = setTimeout(() => {
      const next = (page + 1) % products.length;

      listRef.current?.scrollToIndex({ index: next, animated: true });
      setPage(next);
    }, AUTO_SCROLL_MS);

    return () => clearTimeout(timer);
  }, [isAuto, page, products.length]);

  function onSettled(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  return (
    // Gutter cancelled on the frame and re-applied per page, so a page spans the device width
    // and `pagingEnabled` lands on a card instead of a gutter early.
    <Box marginHorizontal="sNegative16" gap="s12">
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={products}
        keyExtractor={product => product.id}
        renderItem={({ item }) => (
          <Box width={width} paddingHorizontal="s16">
            <ProductCard product={item} onPress={onOpenProduct} />
          </Box>
        )}
        // One product is not a carousel: without this it rubber-bands sideways, which reads as a
        // second page failing to load.
        scrollEnabled={products.length > 1}
        onScrollBeginDrag={() => setTaken(true)}
        onMomentumScrollEnd={onSettled}
        // The row is laid out before its images resolve, so an auto page can land before the
        // row exists; without this the carousel throws instead of settling on the next frame.
        onScrollToIndexFailed={() => undefined}
        showsHorizontalScrollIndicator={false}
      />

      {products.length > 1 && (
        <Box flexDirection="row" gap="s4" alignSelf="center">
          {products.map((product, index) => (
            <AnimatedBox
              key={product.id}
              layout={motion.resize}
              width={index === page ? DOT_ACTIVE : DOT}
              height={DOT}
              borderRadius="s2"
              backgroundColor={index === page ? "accent" : "border"}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

const AUTO_SCROLL_MS = 4000;
const DOT = 6;
const DOT_ACTIVE = 18;
