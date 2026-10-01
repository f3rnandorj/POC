import type { ComponentProps } from 'react';

import { createText } from '@shopify/restyle';

import type { Theme } from '@theme';

export const Text = createText<Theme>();

export type TextProps = ComponentProps<typeof Text>;
