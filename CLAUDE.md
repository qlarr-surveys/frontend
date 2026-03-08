# CLAUDE.md

## Project Overview
Qlarr Frontend is a monorepo containing:
1. **`@qlarr/design-engine`** — Pure JavaScript library with the core survey design logic (DSL, instruction generation, validation rules, component factories). No React/Redux/browser dependencies. Usable in Node.js.
2. **`@qlarr-surveys/frontend`** — React-based web application for creating, managing, and running surveys using the design engine.

Surveys are defined as JSON (UI-agnostic components) with JavaScript instructions for complex logic.

## Monorepo Structure
```
frontend/                          (repo root)
  package.json                     (npm workspaces root)
  packages/
    design-engine/                 (@qlarr/design-engine)
      src/
        index.js                   # Barrel export
        state/                     # addInstructions, stateUtils
        constants/                 # design rules, instruction patterns, theme, language, questionTypes
        utils/                     # isEquivalent, diff, color, access/dependencies, access/jumpDestinations
        factories/                 # createGroup, createQuestion
        validation/                # questionDesignError
        designMode.js              # DESIGN_SURVEY_MODE constants
  apps/
    frontend/                      (@qlarr-surveys/frontend)
      src/
        components/                # UI components (auth, common, design, manage, run, Questions)
        pages/                     # Page-level components
        state/                     # Redux slices (designState, runState, editState, templateState)
        services/                  # API service classes
        networking/                # Axios instances and endpoint definitions
        hooks/                     # Custom React hooks
        theme/                     # MUI theme config
        constants/                 # App constants (editor, language, roles)
        utils/                     # Utility functions
        layouts/                   # Layout components
        assets/                    # Static assets
        styles/                    # Global CSS
```

## Tech Stack
- **Monorepo**: npm workspaces
- **Framework**: React 18, JavaScript (JSX — no TypeScript)
- **Build tool**: Vite 5 (app build + library mode for design-engine)
- **UI library**: MUI v5 with Emotion CSS-in-JS
- **State management**: Redux Toolkit (two stores: `runStore` for survey responses, `manageStore` for survey editing)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup validation
- **HTTP client**: Axios with JWT auth interceptors (access + refresh token rotation)
- **i18n**: i18next — supported languages: en, ar, de, es, pt, fr, nl (RTL support for Arabic)
- **Rich text editor**: TipTap
- **Drag & drop**: react-dnd

**Entry points**: `apps/frontend/src/index.jsx` → `App.jsx` → `Web.jsx` (web) / `Android.jsx` (android) → `routes.js`
**Store config**: `apps/frontend/src/store.js` (defines both `runStore` and `manageStore`)

## Path Aliases
`~/` maps to `apps/frontend/src/` (configured in `jsconfig.json`)

## Development
- **Package manager**: npm (workspaces)
- **Node version**: 16+
- Copy `apps/frontend/.env.example` to `apps/frontend/.env` and set `VITE_BE_URL`

### Commands (from repo root)
| Command | Purpose |
|---------|---------|
| `npm start` | Dev server on port 3000 |
| `npm run build` | Build engine + frontend |
| `npm run build:engine` | Build design-engine only |
| `npm run build:frontend` | Build frontend only |
| `npm run build-staging -w apps/frontend` | Staging build |
| `npm run build-android -w apps/frontend` | Android build |

### Environment Variables (in `apps/frontend/.env`)
```
VITE_FRONT_END_HOST=localhost:3000
VITE_PROTOCOL=http
VITE_BE_URL=http://localhost:8080/
```

## Design Engine (`@qlarr/design-engine`)
Pure logic package — no React, Redux, MUI, or browser APIs. Contains:
- **Instruction DSL**: `addInstructions.js` — generates JavaScript instruction objects for survey execution
- **State utilities**: `stateUtils.js` — ID generation, validation defaults, reordering
- **Constants**: design rules, instruction regex patterns, theme defaults, language definitions, question type data
- **Factories**: `createGroup`, `createQuestion` — create survey component data structures
- **Validation**: `questionDesignError` — validates question structure
- **Utilities**: deep equality, diff, color calculations, dependency/skip-destination analysis

Import from the engine: `import { createQuestion, setupOptions } from "@qlarr/design-engine"`

## Code Conventions
- **Components**: Functional only, `React.memo` for optimization, PascalCase file/folder names
- **Barrel exports**: `index.jsx` files in component folders
- **Styling**: MUI `sx` prop and CSS modules (`.module.css`)
- **Forms**: RHF wrapper components in `components/hook-form/`
- **State**: Redux Toolkit slices in `state/`, custom debounced save middleware for auto-saving
- **Services**: Class-based service layer in `services/` with a `BaseService` for common error handling
- **Auth**: JWT Bearer tokens via Axios interceptors, automatic token refresh on 401
- **Lazy loading**: Route-based with React.lazy + Suspense
- **Design logic imports**: Pure logic should be imported from `@qlarr/design-engine`, not from internal paths

## PR Conventions
- PR titles MUST use semantic/conventional commit prefixes (enforced by `.github/workflows/lint-pr.yaml`)
- Valid prefixes: `fix:`, `feat:`, `refactor:`, `chore:`, `docs:`, `style:`, `perf:`, `test:`, `build:`, `ci:`, `revert:`
- Example: `fix: sidebar icon ripple area` or `feat: add new survey type`

## Deployment
- **Docker**: Multi-stage Dockerfile at repo root (Node 18 build → Nginx serve on port 80)
- **Production**: Use the docker-compose from the backend repo to deploy both frontend and backend
