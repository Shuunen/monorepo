# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

**Specialized Instruction Files:**

- `.github/copilot-instructions.md` - Comprehensive best practices, architecture overview, and code style guidelines
- `.github/instructions/unit-testing.instructions.md` - Detailed unit testing guidelines and coverage interpretation
- `.github/instructions/nx.instructions.md` - Nx workspace configuration and task execution

## Project Overview

This is a **TypeScript React monorepo** with 13+ applications and 3 shared libraries, managed by **Nx** and **pnpm**. It uses modern tooling: **Vite** for bundling, **Vitest** for testing, **Biome** and **OxLint** for linting/formatting, and **Tailwind CSS** for styling.

## Common Commands

### Development & Building

```bash
# Start dev mode (components library by default)
pnpm run dev

# Start specific application
nx dev [app-name]

# Build all projects
pnpm run build

# Build specific project
nx build [project-name]
```

### Testing commands

```bash
# Run all tests
pnpm run test

# Run tests for specific project
nx test [project-name]

# Run single test file
nx test [project-name] -- [test-file-pattern]

# Update snapshots
pnpm run test:update

# Run E2E tests (sample-web-app-e2e)
nx e2e sample-web-app-e2e

# Run Storybook tests (component library)
pnpm run storybook:test

# Run Storybook dev (interactive component browsing)
pnpm run storybook:run
```

### Code Quality

```bash
# Full validation suite (required before commit)
pnpm run check

# Check and fix linting/formatting issues
pnpm run lint

# Check specific tool
pnpm check:biome    # Biome linting/formatting
pnpm check:oxlint   # Rust-based linting
pnpm check:lock     # pnpm lockfile validation
pnpm check:nx       # Nx validation (lints all projects individually)
```

### Dependency Management

```bash
# Add new component from shadcn/ui
pnpm run add:shadcn

# Create new application
pnpm run add:app

# Update dependencies (interactive, includes Nx migration)
pnpm run up:deps
pnpm run up:nx
pnpm run up:sb      # Storybook update
```

## Architecture & Project Structure

### Directory Layout

```bash
/apps                          # 13+ standalone applications
├── sample-web-app/           # Main reference React app
├── sample-web-app-e2e/       # E2E tests for sample-web-app
├── vet-web/                  # Veterinary clinic app
├── recipes/                  # Recipe management app
├── what-now/                 # Electron desktop app
├── user-scripts/             # Browser userscripts (36+ scripts)
└── [other-apps]/             # Additional applications

/libs                         # Shared libraries
├── components/               # Reusable React UI components (with Storybook)
├── utils/                    # Utility functions and helpers
└── vite-plugins/             # Custom Vite plugins

/docs                         # Documentation and manuals
```

### Workspace Configuration

**Path Aliases** (defined in `tsconfig.base.json`):

- `@monorepo/components` → `libs/components/src`
- `@monorepo/utils` → `libs/utils/src`
- `@monorepo/vite-plugins` → `libs/vite-plugins/src`

Each project has `project.json` (Nx) defining:

- `build` - Build target
- `test` - Run tests
- `lint` - Lint code
- `dev` - Development server
- `e2e` - E2E tests (where applicable)

### Technology Stack

**Core:**

- React 19.2
- TypeScript 5.9
- Vite 7.1 (bundler)
- Nx 22.0 (monorepo orchestration)

**Styling:**

- Tailwind CSS 4.1
- Emotion (CSS-in-JS alternative)
- Class Variance Authority (component variants)

**Routing & Forms:**

- TanStack React Router 1.134
- React Hook Form 7.66

**Testing:**

- Vitest 4.0 (unit/component, Vite-native, happy-dom environment)
- Playwright 1.56 (E2E browser testing)
- Storybook 10.0 (component docs + visual testing)
- Testing Library (React testing utilities)

**Code Quality:**

- Biome 2.3 (primary formatter & linter)
- oxlint 1.25 (Rust-based secondary linting layer)

**Other Tools:**

- pnpm 8+ (package manager)
- Bun (CLI script runtime)
- Zod (schema validation)
- Lucide React (icon library)

## Key Development Patterns

**For comprehensive best practices, import conventions, and code style guidelines, refer to [`.github/copilot-instructions.md`](.github/copilot-instructions.md)**

Key highlights from copilot instructions:

- **Avoid `as` type assertions** unless absolutely necessary
- **Use named functions** instead of arrow functions (better stack traces)
- **Use `Result.trySafe()`** from `@monorepo/utils` for error handling instead of try/catch
- **Always export directly** functions/variables instead of exporting objects
- **camelCase** for all variables and functions, even constants
- **Use `bun`** to execute `.cli.ts`/`.cli.js` scripts
- **Prefer descriptive names** over comments

### Import Conventions

```typescript
// Always import from workspace packages
import { Logger, createState, tw, dom, Result } from '@monorepo/utils'
import { Button, Card } from '@monorepo/components'

// Use workspace protocol for internal dependencies in package.json
"@monorepo/utils": "workspace:*"
```

### Component Development (`libs/components/`)

1. Create component + TypeScript types
2. Create `Component.stories.tsx` alongside component
3. Barrel file auto-generation: `bun libs/components/bin/add.cli.ts`
4. Use shadcn/ui for community components: `pnpm run add:shadcn`
5. Use Class Variance Authority (CVA) for component variants

### Application Development (`apps/[app-name]/`)

**Web Apps:**

- React and TypeScript
- TailwindCSS for styling
- Use components from `@monorepo/components` shared library
- Use utilities from `@monorepo/utils` shared library
- Page naming: `PageXxx` pattern
- Router: TanStack React Router or preact-router
- Forms: React Hook Form
- If a state is needed, use `createState()` from `@monorepo/utils` for lightweight state management

**Entry Points:**

- `src/main.tsx` - Application entry
- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration
- `tsconfig.json` - Project-specific TypeScript config (extends base)

### Testing

**For comprehensive testing guidelines, refer to [`.github/instructions/unit-testing.instructions.md`](.github/instructions/unit-testing.instructions.md)**

**Test Structure:**

- **Unit/Component Tests:** Co-located with source (`*.test.ts` / `*.test.tsx`)
- **Test File:** Use single global `describe` per test file
- **Test Environment:** happy-dom (Vitest default)
- **E2E Tests:** Playwright (sample-web-app-e2e)
- **Visual Tests:** Storybook + vitest addon for component library
- **Coverage:** V8 provider, **100% threshold enforced** on all metrics (statements, branches, functions, lines)

**Testing Guidelines:**

- Test naming: `it('functionName A should ...', () => {})` with auto-incrementing letter per function
- Use `toMatchInlineSnapshot()` for most assertions
- Mock external dependencies with `vi.mock()`
- Use `beforeEach`/`afterEach` hooks for setup/cleanup
- Update snapshots: `pnpm run test:update`

### User Scripts Guidelines

See `.github/copilot-instructions.md` for detailed patterns:

- Avoid IIFEs; use direct function calls
- Main function name matches filename (PascalCase, e.g., `AliExpressTakeout` for `aliexpress-takeout.user.js`)
- Export functions for testing: `if (globalThis.window) MainFunc() else module.exports = { helperFunc }`
- Meta `@match` patterns: no wildcard domains (use `https://linxo.com/*` not `https://*.linxo.com/*`)
- Meta `@downloadURL` and `@updateURL` should point to raw GitHub file

### Linting & Formatting

**Biome** :

- Handles formatting + linting
- Enforced on save in VS Code

**OxLint** :

- Handles formatting + linting
- Enforced on save in VS Code

**Pre-commit:** Always run before committing:

```bash
pnpm run check
```

This validates: lock file integrity, monorepo structure, Biome rules, oxlint rules, and Nx consistency

## Essential Patterns & Anti-Patterns

**From `.github/copilot-instructions.md`:**

✅ DO:

- Import utilities from `@monorepo/utils` rather than reimplementing locally
- Use `cn()` helper for TailwindCSS class composition
- Use `createState()` for reactive state management
- Use components from `@monorepo/components` for UI consistency
- Use `Logger` for consistent logging across all projects
- Leverage `Result.trySafe()` for graceful error handling

❌ DON'T:

- Don't install duplicate utilities - add to `@monorepo/utils` if needed
- Don't skip test coverage - maintain 100% threshold
- Don't implement custom state management - use `createState()` from utils
- Don't use try/catch - use `Result.trySafe()` instead
- Don't export objects with functions - export functions directly
- Don't use switch statements - use if statements instead for better readability and error handling at the end
- **Don't edit files in `shadcn/` folder** - these are third-party components managed by shadcn/ui, not part of the project codebase
- **Don't delete failing tests** - always fix the root cause instead of removing tests that expose problems

## Practical Development Tasks

### Adding New Packages

- Always add to root `package.json` if shared
- Use workspace protocol for internal packages: `"@monorepo/components": "workspace:*"`
- Run `pnpm install` after changes

### Modifying Existing Components

- Keep stories updated alongside component changes
- Run `pnpm run storybook:test` to verify visual regressions
- Consider variant patterns using CVA

### Creating New Applications

Use the CLI tool:

```bash
pnpm run add:app
```

This scaffolds all necessary files (entry point, config, tests, tsconfig)

### Snapshot Testing

Vitest snapshots are committed to git. Update with:

```bash
pnpm run test:update
```

Review diffs before committing snapshot changes.

### Affected Testing

Speed up CI by testing only changed projects:

```bash
nx affected -t test
nx affected -t lint
nx affected -t build
```

## Monorepo Structure Conventions

The repo enforces structure via `repo-checker` validation:

- **Apps** in `/apps` with `project.json`
- **Libraries** in `/libs` with `package.json`
- **Tests** in `e2e/` directories or co-located `*.test.tsx`
- **Stories** co-located in `*.stories.tsx`
- **Documentation** in `/docs` and `.storybook/`

## Performance Optimization

Nx caches task results. To see what's cached:

```bash
nx show projects
nx graph
```

Nx daemon auto-manages background process. Check status:

```bash
nx reset
```

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml` runs:

- Linting (Biome + oxlint)
- Unit/component tests
- Build verification
- E2E tests (sample-web-app-e2e)

Automated dependency updates via Renovate.

## Reference Documentation

This CLAUDE.md consolidates high-level guidance. For detailed specifications, refer to:

| File                                                    | Purpose                                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`.github/copilot-instructions.md`**                   | Complete best practices, code style, architecture patterns, import conventions, and anti-patterns              |
| **`.github/instructions/unit-testing.instructions.md`** | Comprehensive unit testing guidelines, coverage interpretation, test writing patterns, and snapshot management |
| **`.github/instructions/nx.instructions.md`**           | Nx workspace MCP server guidelines and task execution patterns                                                 |

### Quick Lookup Guide

- **How should I write code?** → `.github/copilot-instructions.md`
- **How should I write tests?** → `.github/instructions/unit-testing.instructions.md`
- **How do I use Nx?** → `.github/instructions/nx.instructions.md` + `pnpm run check`
- **Common commands?** → "Common Commands" section above
- **Architecture overview?** → "Architecture & Project Structure" section above
- **What's the tech stack?** → "Technology Stack" section above
- there is no need to unstage files to edit them
