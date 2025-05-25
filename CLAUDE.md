# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

Qlarr is a comprehensive survey platform that enables creation, management, and execution of interactive surveys. The frontend is a React-based application supporting both web and mobile (Android WebView) deployments.

**Key Features:**
- **WYSIWYG Survey Designer**: Drag-and-drop question creation with real-time preview
- **Multi-Platform Runtime**: Web browser and Android app survey execution
- **Advanced Template System**: Nunjucks-powered dynamic content with question references
- **Multi-Language Support**: Full internationalization with RTL text support
- **Rich Question Types**: MCQ, SCQ, text, date, photo capture, signature, NPS, ranking, and more
- **Skip Logic & Validation**: Complex survey flow control and response validation
- **Offline-First Architecture**: Resilient survey execution with auto-save
- **Theme Customization**: Flexible styling and branding options
- **Response Management**: Real-time response collection, viewing, and export

**Technology Stack:**
- React 18 with hooks and modern patterns
- Redux Toolkit for state management
- Material-UI for component library
- Nunjucks for templating
- Vite for build tooling
- TypeScript for new development

## Commands

### Development
- `npm start` - Start development server on localhost:3000
- `npm run build` - Production build 
- `npm run build-staging` - Staging build with sourcemaps and no minification
- `npm run build-android` - Android-optimized build
- `npm run build-android-debuggable` - Android debug build
- `npm run serve` - Preview production build

### Testing
- `npm test` - Run test suite with Jest
- `npm run test:watch` - Run tests in watch mode  
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI/CD

### Environment Setup
Create a `.env` file in the root directory to configure environment variables (API endpoints, etc.)

## Architecture Overview

### Multi-Platform Application Structure
This is a React application that serves two primary platforms:
- **Web**: Full survey management platform (design, manage, run surveys)
- **Android**: Survey runtime only (embedded webview)

The platform is determined by Vite build mode:
- `android`/`android-debuggable` modes → Android app (survey runner only)
- Default mode → Web platform (full functionality)

### Core Application Areas

#### 1. Survey Design System (`src/pages/DesignSurvey/`, `src/components/design/`)
WYSIWYG editor for creating surveys using the Qlarr Survey Engine DSL:
- Drag-and-drop question components
- Real-time preview
- Theme customization
- Multi-language support
- Skip logic builder using `@react-awesome-query-builder/mui`

#### 2. Survey Runtime (`src/pages/RunSurvey/`, `src/components/run/`)
Renders and executes surveys created by the design system:
- Question type rendering (MCQ, text, date, photo capture, etc.)
- Offline-first architecture
- Progress tracking and validation
- Multi-language switching

#### 3. Survey Management (`src/pages/manage/`, `src/components/manage/`)
Administrative interface for survey lifecycle:
- Survey creation, cloning, deletion
- User management and permissions
- Response viewing and export
- Survey quota and scheduling

### State Management Architecture

**Redux Toolkit** with separate stores:
- `runStore` - Survey execution state (responses, navigation)
- `manageStore` - Design and management state with auto-save middleware

Key state slices:
- `designState` - Survey structure, questions, theming
- `runState` - Survey responses, current question, validation
- `editState` - Survey metadata, settings, permissions
- `templateState` - Shared templates and examples

### Question Component System

Questions are modular components in `src/components/Questions/`:
- Each question type has Design and Runtime components
- Design components handle setup, validation, theming
- Runtime components handle user interaction and data collection
- Common utilities in `buildReferences.jsx` and `utils.jsx`

### Internationalization (i18n)

Multi-namespace i18n with `react-i18next`:
- `design` - Survey design interface
- `run` - Survey runtime interface  
- `manage` - Management interface
- Translation files in `public/locales/`

### Networking Layer

Service-based architecture in `src/services/`:
- `BaseService` - Common error handling and API patterns
- Platform-specific services (DesignService, RunService, etc.)
- Authenticated vs public API clients
- Auto-retry and error processing

### Path Alias
Uses `~` alias for `src/` directory (configured in vite.config.js)

### Component Organization
- Components organized by feature area (design/, run/, manage/)
- Shared components in common/
- CSS Modules for styling with `.module.css` files
- Material-UI theming system in `src/theme/`

## Development Guidelines

### TypeScript Requirements
**IMPORTANT**: All new code should be written in TypeScript:
- New files should use `.ts` extension for utilities/services
- New React components should use `.tsx` extension
- Existing JavaScript files can be gradually migrated when modified
- Use proper TypeScript interfaces and type definitions

### Code Quality Standards
- Follow existing patterns and conventions
- Use TypeScript for type safety and better developer experience
- Maintain consistent naming conventions
- Add proper JSDoc comments for functions and components

## Additional Documentation

For comprehensive technical documentation, architecture analysis, and implementation details, see the `.claude/` directory:

- **`.claude/README.md`** - Overview and quick reference
- **`.claude/SURVEY_ARCHITECTURE_ANALYSIS.md`** - Deep architectural analysis
- **`.claude/DATA_FLOW_DOCUMENTATION.md`** - Data flow patterns and structures
- **`.claude/TEMPLATE_SYSTEM_IMPROVEMENTS.md`** - Template system roadmap
- **`.claude/LEGACY_PARSING_REMOVAL.md`** - Legacy code cleanup documentation

The `.claude/` directory contains detailed technical analysis, implementation guides, and future roadmaps that complement this high-level overview.