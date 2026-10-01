# PRD: App Foundation

**Status:** done
**Completed:** 2026-10-01
**Started:** 2026-10-01
**Source:** README — "Entrega" (`npm install` / `npm run ios`) + `.claude/standards/architecture.md`

## Overview

Scaffold the React Native CLI app and stand up the four cross-cutting pieces every later block depends on: path aliases, the Restyle theme, the React Query provider and the navigation shell. Nothing merchant-specific and no Shopify call — this block ends with an app that boots on a simulator and navigates between two placeholder screens.

## Goals

- `yarn ios` boots the app on a simulator from a clean clone
- Every `src/` module is reachable through its `@{module}` alias
- A screen can render `<Box backgroundColor="background" padding="s16">` and a `Text` variant without touching `StyleSheet`
- A `useQuery` anywhere in the tree resolves against a configured client

## Standards Referenced

- `.claude/standards/architecture.md` — folder structure, barrels, layer rules
- `.claude/standards/naming.md` — file and symbol conventions
- `.claude/standards/design.md` — palette, text variants, spacing scale, radius
- `.claude/standards/code-style.md` — import order, file order, function declarations

## Decisions Referenced

- 2026-09-30 — Profile mobile (RN CLI), dev mode ai-assisted
- 2026-09-30 — Design identity: streetwear, neutral + one accent, geometric sans, compact
- 2026-09-30 — No test layer; verification is the simulator
- 2026-10-01 — RN CLI conventions (hook naming, singleton export order, barrel placement)

## Quality Gates

- `yarn ios` opens the app and both placeholder screens are reachable
- `yarn tsc --noEmit` clean
- No `StyleSheet.create` and no raw hex outside `theme/palette.ts`

## User Stories

### US-001: Scaffold the RN CLI app

As a developer, I want the React Native CLI project generated into the existing repo so that the POC runs on a simulator.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `@react-native-community/cli init` output merged into the repo root, preserving `README.md`, `CLAUDE.md`, `.claude/` and `.env`
- [x] `.gitignore` covers `.env`, `node_modules`, `ios/Pods`, build output
- [x] `yarn install` + `pod install` complete without error
- [x] `yarn ios` renders the default screen on a simulator
- [x] `git init` + first commit (repo is not yet versioned)

### US-002: Path aliases

As a developer, I want `@{module}` aliases so that imports never use a relative climb.

**Depends on:** US-001
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `tsconfig.json` `paths` declares every alias listed in `architecture.md`
- [x] `babel.config.js` carries the matching `module-resolver` entries
- [x] An import of `@theme` resolves in both the type-checker and Metro
- [x] Each aliased folder has an `index.ts`

### US-003: Restyle theme

As a developer, I want the design tokens as a Restyle theme so that no component declares a raw color or spacing value.

**Depends on:** US-002
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `theme/palette.ts` holds the color tokens; no hex anywhere else
- [x] `theme/theme.ts` runs `createTheme` with `colors`, `spacing` (`s4 s8 s12 s16 s24 s32`), `borderRadii` (`s2`, `s4`), empty shadow scale
- [x] `theme/textVariants.ts` declares `displayLarge`, `titleMedium`, `priceLarge`, `body`, `caption`, `badge` — uppercase is a variant, never `.toUpperCase()`
- [x] `Box`, `Text` and `PressableBox` exported from `@components` via `createBox` / `createText`
- [x] `useAppTheme()` wraps `useTheme<Theme>()`
- [x] `ThemeProvider` wired at the app root

### US-004: React Query provider

As a developer, I want a configured query client so that useCase hooks have a cache to resolve against.

**Depends on:** US-002
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `QueryClientProvider` at the app root, above navigation
- [x] `infra/infraTypes.ts` exports the `QueryKeys` enum and `MutationOptions<T>`
- [x] No persisted cache (quick-rule: in-memory only)

### US-005: Navigation shell

As a user, I want to move between screens so that the later blocks have somewhere to render.

**Depends on:** US-003, US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `routes/Router.tsx` holds the `NavigationContainer`
- [x] `routes/AppStack.tsx` declares a native stack with two placeholder screens
- [x] `routes/types/navigationTypes.ts` types `AppStackParamList` per screen
- [x] Navigating between the two screens works on the simulator
- [x] Screens live in `screens/{Name}Screen/{Name}Screen.tsx` with no local `index.ts`

## Functional Requirements

- FR-1: The app boots on iOS from `yarn install && cd ios && pod install && cd .. && yarn ios`
- FR-2: Styling is Restyle props only
- FR-3: Imports use module-root aliases only

## Non-Goals

No Shopify call, no domain layer, no real screen content, no Android-specific tuning beyond the default scaffold, no splash/icon work.

## Technical Considerations

- Stack pinned by quick-rule #1: RN CLI + TypeScript, React Navigation, TanStack Query v5, `@shopify/restyle`, `react-native-config`, yarn. No Expo.
- The repo root already holds files, so the scaffold is generated elsewhere and merged in — a bare `init` into a non-empty directory fails.
- Restyle `createTheme` must be typed and exported as `Theme`, otherwise prop autocompletion dies and raw values creep back in.

## Success Metrics

- Clean clone to running app in under 5 minutes of commands
- Zero `style={{}}` in the committed tree

## Resolved Decisions

- **Android parity** — iOS is the demo target. Android keeps the default scaffold; `dotenv.gradle` is applied so a later Android run is not blocked, but no Android build was exercised.
- **Jest left out of the merge** — the RN CLI template ships `jest.config.js` + `__tests__`. Both were dropped on merge and jest removed from `devDependencies`, so the tree matches the declared fact "no test layer installed" (quick-rule #11) instead of carrying a config nothing runs.
- **`theme/colors.ts` split out of `theme.ts`** — `textVariants.ts` needs the semantic token names to type its `color`, and importing `theme.ts` would be circular. The split makes the token list a single source instead of a hand-kept copy.
- **Every text variant carries a `color` token** — a `Text` with no explicit color was rendering near-black on the near-black background. `defaults` now sets `color: 'text'`.
- **`react-native-config` wired in this block** — the native plumbing (autolinked pod script phase + `dotenv.gradle`) and the tracked `.env.example` are foundation work; `merchantConfig.ts` consuming it stays in 008.

## Open Questions

- **Type family** — design.md names Inter or Satoshi; this block ships the iOS system font (SF Pro) with no font assets linked. Needs a decision before the UI blocks land.
