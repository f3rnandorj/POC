import { Box, ProductFilmstrip, ProductGallery } from "@components";
import { productDetailLayout } from "@config";
import type { ProductImage } from "@domain";

interface ProductMediaProps {
  images: ProductImage[];
  /** The selected variant's photo — the arrangements that show one photo at a time follow it. */
  activeUrl?: string;
  altFallback: string;
}

/** The empty case lives here, once: a product with no photo still owes the screen a frame. */
export function ProductMedia({
  images,
  activeUrl,
  altFallback,
}: ProductMediaProps) {
  if (images.length === 0) {
    return <Box backgroundColor="surface" aspectRatio={1} width="100%" />;
  }

  switch (productDetailLayout().media) {
    case "filmstrip":
      return (
        <ProductFilmstrip
          images={images}
          activeUrl={activeUrl}
          altFallback={altFallback}
        />
      );

    case "gallery":
      return (
        <ProductGallery
          images={images}
          activeUrl={activeUrl}
          altFallback={altFallback}
        />
      );
  }
}
