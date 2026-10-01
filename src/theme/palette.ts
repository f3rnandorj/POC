/**
 * The only file in the tree allowed to hold a raw color literal (quick-rule #9).
 * Names here are physical (`ink`, `volt`); semantic roles are assigned in `theme.ts`.
 */
export const palette = {
  ink: '#0A0A0A',
  carbon: '#141414',
  graphite: '#262626',
  ash: '#8A8A8A',
  chalk: '#FAFAFA',
  volt: '#E2FF43',
  mint: '#3DDC84',
  ember: '#FF4438',
  transparent: 'transparent',
} as const;
