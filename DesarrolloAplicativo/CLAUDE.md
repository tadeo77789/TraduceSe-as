# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Traduce Señas

A sign language translation app (React Native + Expo) with a planned Node.js/Express backend. The `backend/` folder currently contains only module-level readme stubs — all active code lives in `app/`.

## Commands

All commands run from the `app/` directory:

```bash
# Install dependencies (first time or after package.json changes)
npm install

# Run on web (recommended for development)
npx expo start --web --port 8082

# Run on Android emulator
npx expo start --android

# Run on physical device (scan QR with Expo Go)

```

There are no tests or linters configured yet.

## Architecture

### Frontend (`app/`)

**State management** — Two React Contexts in `app/state/`:
- `AuthContext.tsx` — auth state (user, token, isAuthenticated). Persists to AsyncStorage via `@auth_token` / `@auth_user`. Login/register currently use mock data with `// TODO: conectar con el backend real` comments.
- `ThemeContext.tsx` — light/dark mode toggle (dark mode not yet applied to screens).

**Navigation** (`app/presentation/navigation/`):
- `AppNavigator` — root; switches between `AuthNavigator` and `MainTabNavigator` based on `isAuthenticated`.
- `AuthNavigator` — stack: Landing → Login → Register → ForgotPassword → VerifyCode → NewPassword.
- `MainTabNavigator` — bottom tabs (Translation, Alarms, Alphabet, Stats, History, Profile). On web, replaces the tab bar with `WebTopBar` (horizontal top navigation).

**Screens** (`app/presentation/screens/`): One folder per feature. All screens are presentational — business logic lives in hooks.

**Custom hooks** (`app/hooks/`): Form logic extracted into `useLoginForm` and `useRegisterForm`, each handling validation state and calling the auth context.

**Design system** — Centralized in `app/constants/`:
- `colors.ts` — full color palette (primary purple `#7C3AED`, semantic tokens for text/bg/border/state).
- `sizes.ts` — spacing, font sizes, border radii, component heights.
- `strings.ts` — all UI text strings (i18n-ready structure).
- `theme.ts` — advanced design tokens (`Spacing`, `FontSize`, `BorderRadius`, `Shadows`, `ZIndex`, `ComponentSizes`, `Animation`). More granular than `sizes.ts`.

**API config** (`app/config/api.config.ts`): Defines `API_BASE_URL` (dev: `http://10.0.2.2:3000/api`, prod: `https://api.traducsenas.com/api`) and all `ENDPOINTS`. The frontend is wired to call this backend but it doesn't exist yet.

**Shared components** (`app/presentation/components/common/`): `Button` (variants: primary, secondary, danger, outline, ghost), `Input`, `AppHeader` (mobile), `WebTopBar` (web).

### Backend (`backend/src/`)

Folder structure only — no implementation files exist yet. Planned modules: `auth`, `users`, `translations`, `lexicon`, `alarms`, `notifications`, `stats`, `history`, `profile`. Also has stubs for `controllers/`, `middlewares/`, `repositories/`, `routes/`, `services/`, `utils/`, `validators/`.

### Database (`BD/`)

PostgreSQL. Schema files were removed from git tracking (previously tracked as a submodule).

## Key conventions

- Styles defined inline via `StyleSheet.create` within each screen/component file.
- Platform branching via `Platform.OS === 'web'` for web vs mobile differences.
- TypeScript types all defined in `app/types/index.ts`.
- To change any visual globally: edit `app/constants/colors.ts` or `app/constants/sizes.ts` — no need to touch screens.
- To change any UI text: edit `app/constants/strings.ts`.
