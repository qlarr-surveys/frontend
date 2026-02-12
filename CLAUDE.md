# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qlarr Surveys frontend — a React SPA for creating, managing, and running surveys. Built with Vite, Material UI v5, and Redux Toolkit. Supports both web and Android WebView (single codebase, dual entry points: `Web.jsx` and `Android.jsx`).

## Commands

- **Dev server**: `npm start` (runs on localhost:3000)
- **Production build**: `npm run build` (outputs to `build/`)
- **Staging build**: `npm run build-staging` (unminified, with sourcemaps)
- **Android build**: `npm run build-android`
- **Preview build**: `npm run serve`

No lint, test, or format scripts are configured.

## Environment Setup

Copy `.env.example` to `.env`. Required variables (all `VITE_` prefixed):
- `VITE_FRONT_END_HOST` — frontend host (default: `localhost:3000`)
- `VITE_PROTOCOL` — `http` or `https`
- `VITE_BE_URL` — backend API URL (default: `http://localhost:8080/`)

## Architecture

### Import Alias

The `~` alias resolves to `src/`. All imports use this convention:
```js
import Component from "~/components/SomeComponent";
```

### Dual Redux Stores (`src/store.js`)

- **`runStore`**: Survey execution runtime — slices: `runState`, `templateState`
- **`manageStore`**: Survey design/management — slices: `designState`, `editState`, `templateState`. Includes auto-save middleware (`dataSaver`, `editDataSaver`)

### API Layer (`src/services/`)

Service classes extend `BaseService`. Two Axios instances:
- `authenticatedApi.js` — JWT Bearer token with auto-refresh on 401
- `publicApi.js` — no authentication

Key services: `AuthService`, `DesignService`, `RunService`, `SurveyService`, `UserService`, `TokenService` (cookie-based JWT storage).

### Android Bridge

`src/networking/run.js` checks for `window["Android"]` and delegates API calls to native Android methods instead of HTTP when running inside a WebView.

### Survey Engine

Uses an external `qlarrStateMachine` loaded at runtime via a dynamically injected `<script>` tag (`runtime.js`). This handles survey navigation logic, skip patterns, and validation.

### Page Structure

All page components in `src/pages/` are lazy-loaded with `React.lazy()` and `<Suspense>`. Routes defined in `src/Web.jsx`. Auth checked via `TokenService.isAuthenticated()`.

User roles: `super_admin`, `survey_admin`, `surveyor`, `analyst` (defined in `src/constants/roles.js`).

### Question Types (`src/components/Questions/`)

30+ question types (text, number, SCQ, MCQ, NPS, ranking, date/time, file upload, signature, barcode, media capture, autocomplete, matrix variants, icon/image variants). Each type has its own directory with design and runtime components.

### i18n (`public/locales/`)

Uses i18next with lazy-loaded namespaces: `manage`, `run`, `design/core`, `design/editor`, `design/logic`, `design/tooltips`. Supported languages: en, ar, de, es, fr, nl, pt. Arabic has RTL support via `stylis-plugin-rtl`.

### Styling

MUI v5 theming (`src/theme/`), Emotion CSS-in-JS, and CSS Modules (`.module.css`). Component overrides in `src/theme/overrides/`.

## Conventions

- JavaScript only (no TypeScript)
- Component directories use `index.jsx` as entry point
- PR titles must follow semantic commit format (enforced by CI)
- Rich text editing uses TipTap v3 (`src/components/design/ContentEditor/`)
- Drag-and-drop uses react-dnd with HTML5 and touch backends
