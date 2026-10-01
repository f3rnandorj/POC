import type { ComponentProps } from 'react';

import { createBox } from '@shopify/restyle';

import type { Theme } from '@theme';

export const Box = createBox<Theme>();

export type BoxProps = ComponentProps<typeof Box>;
