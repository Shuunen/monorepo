# Copilot Instructions for Shuunen Monorepo

## Architecture Overview

This is an **Nx monorepo** using **pnpm** workspace management with a mix of React/Preact web applications, Node.js utilities, and shared libraries. The core architectural pattern is:

- **`libs/shuutils`**: Central utility library providing DOM helpers, state management, logging, and all kind of utilities
- **`libs/vite-plugins`**: Custom Vite plugins for build tooling
- **`apps/*`**: Individual applications (web apps, CLI tools, user scripts)
- All projects use **TypeScript**, **Vitest** for testing, and **Biome** and **OxLint** for linting/formatting

## Key Development Patterns

### Import Conventions
```typescript
// Always import from the workspace shuutils library
import { Logger, createState, tw, dom } from '@shuunen/shuutils'

// Use workspace protocol for internal dependencies
"@shuunen/shuutils": "workspace:*"
```

### Component Architecture (React/Preact Apps)
- **Preact** is preferred over React for smaller bundle sizes
- Components use functional style with hooks: `useState`, `useCallback`, `useMemo`
- Lazy loading pattern: `const AsyncPage = lazy(() => import('./page').then(({ Page }) => ({ default: Page })))`
- **TailwindCSS** for styling with **ShadCn** components preferred over pre-built libraries like Material-UI
- Page components follow `PageXxx` naming

### State Management
```typescript
// Use shuutils createState for lightweight state management
import { createState } from '@shuunen/shuutils'

export const state = createState({
  isLoading: false,
  items: []
})

// Watch state changes
watchState('isLoading', (value) => { /* handle change */ })
```

### Testing Patterns
- All tests must pass coverage thresholds (100% most of the time)
- Use `vitest` with `toMatchInlineSnapshot()` for most assertions
- Mock external dependencies with `vi.mock()`
- Test file naming: `*.test.ts` alongside source files
- Organize tests with descriptive names: `it('functionName A should do something', () => {})`

**For detailed unit testing guidelines, see [unit-testing.instructions.md](./instructions/unit-testing.instructions.md)**

### Best Practices

- avoid `as` type assertions unless absolutely necessary
- follow DRY principle
- when declaring constants use camelCase convention

## Essential Commands

```bash
# Development workflow
pnpm check              # Run all quality checks (lint, test, build)
nx run-many -t test     # Run all tests across workspace
nx test <project-name>  # Run tests for specific project
nx build <project-name> # Build specific project

# Quality assurance
pnpm check:biome        # Format and lint with Biome
pnpm check:oxlint       # Additional linting with Oxlint  
pnpm check:nx           # Run all Nx tasks (lint, test, build, typecheck)

# Individual tools
nx run-many -t typecheck # TypeScript type checking
nx run-many -t build     # Build all projects
```

## Common Project Patterns

### Web Applications (`apps/stuff-finder`, `apps/jozzo`, etc.)
- Use **Vite** for bundling with **@vitejs/plugin-react** 
- **Preact** with **TailwindCSS** and **ShadCn** components
- Router: `preact-router` with lazy-loaded pages
- Database: **Appwrite** for backend services
- State: Custom lightweight state management via `@shuunen/shuutils`

### CLI Tools (`apps/one-file/*`)
- Single-file utilities for various automation tasks
- Use `@shuunen/shuutils` Logger for consistent output
- Comprehensive test coverage with mocked file system operations
- Export all functions for testability: `export const options = { dry: false }`

### User Scripts (`apps/user-scripts`)
- Browser userscripts for site automation/enhancement
- Use consistent utility patterns for DOM manipulation
- Self-contained scripts with embedded utility functions

## Build & Integration

- **SWC** for fast TypeScript compilation (not tsc)
- **Vitest** workspace configuration via `vitest.workspace.ts`
- **Biome** handles formatting/linting with strict configuration
- **OxLint** for additional linting rules
- **Coverage thresholds** - uncovered code blocks CI
- **Nx** plugins automatically detect and configure tasks from tool configs

## Dependencies & Integration

### External Services
- **Appwrite**: Document database with comprehensive TypeScript models
- **TailwindCSS**: Utility-first CSS with `@tailwindcss/vite` plugin
- **ShadCn**: Component library preferred over pre-built solutions like Material-UI

### Internal Libraries
- Import utilities from `@shuunen/shuutils` rather than implementing locally
- Use `tw()` helper for TailwindCSS class composition
- Leverage `Logger` class for consistent logging across all projects
- Use `createState()` for reactive state management in web apps

## Anti-Patterns to Avoid

- Don't use `tsc` directly - build process uses SWC via Nx
- Don't install duplicate utilities - use `@shuunen/shuutils` 
- Don't skip test coverage - maintain coverage requirement (100% most of the time)
- Don't use React - prefer Preact for smaller bundle sizes
- Don't implement custom state management - use `createState()` from shuutils
