import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { createBox } from '@shopify/restyle';

import type { Theme } from '@theme';

export const PressableBox = createBox<Theme, PressableProps>(Pressable);

export type PressableBoxProps = ComponentProps<typeof PressableBox>;
