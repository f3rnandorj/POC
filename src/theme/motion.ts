import { FadeInDown, LinearTransition } from "react-native-reanimated";

/**
 * One place for motion, same reason colors have one: a card that enters in 260ms next to a
 * card that enters in 500ms reads as a bug, not as variety.
 */
export const motion = {
  /** A card arriving in a list or grid — fades up into place. */
  cardEnter: FadeInDown.duration(260),
  /** A box whose size or position changes between renders. */
  resize: LinearTransition.duration(180),
} as const;
