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

### Testing guidelines

- All tests must pass coverage thresholds (100% most of the time)
- Use `vitest` with `toMatchInlineSnapshot()` for most assertions
- Mock external dependencies with `vi.mock()`
- Test file naming: `*.test.ts` alongside source files
- Organize tests with descriptive names: `it('functionName A should do something', () => {})`

**For detailed unit testing guidelines, see [unit-testing.instructions.md](./instructions/unit-testing.instructions.md)**

### User Scripts guidelines

- Avoid `;(function AliExpressTakeout() { ... })();` pattern and do not use IIFEs, instead do `function AliExpressTakeout() { ... } AliExpressTakeout();`
- Avoid type assertions like `/** @type {HTMLTextAreaElement | undefined} */` when you can use ` if (!(input instanceof HTMLInputElement)) { utils.showError('tableRowAmountInput is not an input element'); return; }` to ensure type safety, if you cannot avoid it, keep the type assertion intact
- The name of the main function should match the filename, e.g. `AliExpressTakeout` for `aliexpress-takeout.user.js` and respect PascalCase convention, all the other functions should be in camelCase
- To allow testing and avoid user script main function execution in unit test environment, every last lines of a user script will be like `if (globalThis.window) AliExpressTakeout() else module.exports = { funcA, funcB }` where `funcA`, `funcB` are the functions outside the main function, they need to be unit-tested. This pattern is used to export functions for unit testing while still allowing the main function to run when the script is executed in a browser environment. If all the functions are inside the main function, just export an empty object.
- the UserScript meta `@name` should be the second line of the file below the `// ==UserScript==` line
- the meta `@downloadURL` and `@updateURL` should be the same URL, pointing to the raw file in the repository, e.g. `https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/linxo-aio.user.js` where `linxo-aio.user.js` is the filename
- the meta `@match` should be the URL pattern where the script should run, but star pattern in the domain part is not allowed, for example `https://*.linxo.com/*` will fail, use `https://linxo.com/*` or `https://www.linxo.com/*` instead
- the meta `@icon` is a URL like `https://www.google.com/s2/favicons?sz=64&domain=linxo.com` where it use the domain from the `@match` URL

### Best Practices

- avoid `as` type assertions unless absolutely necessary
- follow DRY principle
- when declaring constants use camelCase convention
- use standard camelCase for function and variable names **even if they are constants**
- use named functions instead of arrow functions for better stack traces
- use comments only when absolutely necessary, prefer descriptive variable and function names
- avoid using : try,catch,throw or even `.catch` and instead `import { Result } from '@shuunen/shuutils'` and then use `const result = Result.trySafe(() => ...)` to handle errors gracefully
- always export directly each functions and variables (that need to be exported) instead of exporting an object with them
- use `bun` to executes `.cli.js` or `.cli.ts` scripts

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
- Use components from `@shuunen/components` for UI consistency
- Use `@shuunen/vite-plugins` for custom Vite plugins

## Anti-Patterns to Avoid

- Don't install duplicate utilities - use `@shuunen/shuutils`, add new utilities there if needed
- Don't skip test coverage - maintain coverage requirement (100% most of the time)
- Don't implement custom state management - use `createState()` from shuutils
