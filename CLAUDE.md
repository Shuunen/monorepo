# CLAUDE.md

- **Use pnpm package manager** to install dependencies and execute scripts like `pnpm run lint` (run formatter and linter) or `pnpm run check` (run everything, including format and lint)
- **Avoid `as` type assertions** unless absolutely necessary
- **Use named functions** instead of arrow functions (better stack traces)
- **Use `Result.trySafe()`** from `@monorepo/utils` for error handling instead of try/catch
- **Always export directly** functions/variables instead of exporting objects
- **camelCase** for all variables and functions, even constants
- **Use `bun`** to execute `.cli.ts`/`.cli.js` scripts
- **Prefer descriptive names** over comments
