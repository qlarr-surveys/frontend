
<!-- markdownlint-disable line-length -->

# Contributing to Qlarr Frontend

Thank you for your interest in contributing to Qlarr Frontend!

## Development Setup

### Prerequisites

- **Node.js** 16 or later
- **npm** (comes with Node.js)

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/qlarr-surveys/frontend
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure the backend URL in `.env`:

   ```text
   VITE_BE_URL=http://localhost:8080/
   ```

5. Start the development server:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`.

## Available Commands

| Command | Purpose |
| -------- | --------- |
| `npm start` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run build-staging` | Build for staging (ES2018, sourcemaps) |
| `npm run build-android` | Build for Android (ES2015, minified) |
| `npm run build-android-debuggable` | Build Android debug version |

## Code Conventions

- **Components**: Functional React components only, use `React.memo` for optimization
- **Naming**: PascalCase for file and folder names (e.g., `SurveyEditor.jsx`)
- **Barrel exports**: Use `index.jsx` files in component folders
- **Styling**: MUI `sx` prop and CSS modules (`.module.css`)
- **Forms**: Use RHF wrapper components in `components/hook-form/` (RHFTextField, RHFSelect, RHFCheckbox)
- **State**: Redux Toolkit slices in `state/`, debounced save middleware for auto-saving
- **Services**: Class-based service layer in `services/` extending `BaseService`
- **Auth**: JWT Bearer tokens via Axios interceptors
- **Lazy loading**: Route-based with React.lazy + Suspense

## PR Title Format

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `fix:` - Bug fix
- `feat:` - New feature
- `refactor:` - Code refactoring
- `chore:` - Maintenance
- `docs:` - Documentation
- `style:` - Code style
- `perf:` - Performance
- `test:` - Testing
- `build:` - Build system
- `ci:` - CI/CD
- `revert:` - Revert changes

Example: `fix: sidebar icon ripple area` or `feat: add new survey question type`

## Testing

Run the app locally and test your changes. Verify:

- [ ] The development server starts without errors
- [ ] Your feature/b fix works as expected
- [ ] The build completes successfully (`npm run build`)
- [ ] No new lint warnings

## Internationalization

The app supports 7 languages: en, ar, de, es, pt, fr, nl (RTL supported for Arabic).

When adding new strings, use i18next and add translations to locale files in `public/locales/`.

## Need Help?

Join our [Discord server](https://discord.gg/3exUNKwsET) to discuss with the team.
