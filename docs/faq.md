# FAQ

- [FAQ](#faq)
  - [Cannot find module](#cannot-find-module)
    - [Vitest](#vitest)

## Cannot find module

### Vitest

If you have this kind of issue :

```text
> nx run components:test

> vitest --coverage=true --coverage.thresholds.100=true

node:internal/modules/cjs/loader:1228
  throw err;
  ^

Error: Cannot find module '/projects/edac-wui-source-code/node_modules/.pnpm/vitest@3.2.4_@types+node@24.5.2_@vitest+browser@3.2.4_@vitest+ui@3.2.4_happy-dom@19.0.1_5b1eb349d044b5a52824bedddeddc40f/node_modules/vitest/vitest.mjs'
```

It might be related to a corrupted node_modules folder, clean the related folder and try again.

Here for example we will clean components node_modules and re-run the same command :

```bash
rm libs/components/node_modules/ -rf
pnpm install
nx run components:test
```
