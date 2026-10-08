import { FadeInDown, LinearTransition } from "react-native-reanimated";

/** One place for motion: 260ms next to 500ms reads as a bug, not as variety. */
export const motion = {
  cardEnter: FadeInDown.duration(260),
  resize: LinearTransition.duration(180),
} as const;
