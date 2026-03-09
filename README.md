# Shuunen Monorepo

[![Project license](https://img.shields.io/github/license/Shuunen/monorepo.svg?color=informational)](https://github.com/Shuunen/monorepo/blob/master/LICENSE)

![logo](docs/banner.svg)

## Prerequisites

- Enable pnpm once with `corepack enable pnpm`
- Select the typescript version of the workspace (>=5.9.3)
  - ctrl-shift-P: select typescript version: Use workspace version

## Installing and starting the app

```bash
npm install nx --global
pnpm install
nx dev sample-web-app
```

## Todo

- [ ] remove `noUndeclaredDependencies: "off"` from `biome.json` when Biome supports monorepo, for no it's reporting falsy undeclared dependencies
- [ ] remove `explicit-module-boundary-types: off` from oxlint conf and declare types everywhere ?
- [ ] investigate why biome is showing warnings
- [ ] add knip (does it works with monorepo ?)
- [ ] investigate if we need to split output from tsc and build ( right now lib/app go to dist but tsconfig.spec goes to out-tsc)
- [ ] investigate why we need local dependencies like react in utils when react is already in the root package.json, in the other hand apps/sample-web-app works without local react dependency
- [ ] Add optional handling on form-field-field-list component, array level

## Performances

- [ ] check if splitting exports like in the business lib helps with performances or not
- [ ] check if we can merge typecheck with building ( we need to find a solution that can leverage ts-go ) ( or wait for typescript 7)
- [ ] temporary disabled rules, check if we should enable :
  - prefer-readonly-parameter-types (1421 issues)
  - no-floating-promises (609 issues)
  - strict-boolean-expressions (178 issues)
  - no-unsafe-type-assertion (165 issues)
  - strict-void-return (133 issues)
  - no-confusing-void-expression : maybe too neat pick for now (132 issues)
  - no-unsafe-member-access (110 issues)
  - jsx-no-new-function-as-prop (98 issues)
  - no-unnecessary-condition (88 issues)
  - no-unsafe-call (84 issues)
  - no-unsafe-assignment (76 issues)
  - promise-function-async : issue with functions returning new Promise() instead of Promise.withResolvers() which is not supported by tsconfig.base.json yet (65 issues)
  - jsx-props-no-spreading (57 issues)
  - jsx-no-new-object-as-prop (54 issues)
  - prefer-nullish-coalescing (48 issues)
  - no-unnecessary-type-assertion (44 issues)
  - restrict-template-expressions (33 issues)
  - no-deprecated (27 issues)
  - no-misused-promises (23 issues)
  - no-unsafe-argument (22 issues)
  - consistent-return (19 issues)
  - promise/avoid-new (19 issues)
  - no-base-to-string (17 issues)
  - no-redundant-type-constituents (15 issues)
  - unbound-method (14 issues)
  - await-thenable (14 issues)
  - non-nullable-type-assertion-style : maybe too neat pick for now (11 issues)
  - no-unescaped-entities (10 issues)
  - no-array-index-key : conflicts with useStableKeys (9 issues)
  - prefer-regexp-exec (9 issues)
  - no-unsafe-return (9 issues)
  - return-await (8 issues)
  - no-useless-default-assignment (7 issues)
  - no-meaningless-void-operator (7 issues)
  - jsx-handler-names (5 issues)
  - no-unnecessary-type-parameters : we like to use them sometimes (5 issues)
  - prefer-readonly (5 issues)
  - prefer-optional-chain (5 issues)
  - use-unknown-in-catch-callback-variable (4 issues)
  - no-unnecessary-template-expression (4 issues)
  - no-unnecessary-type-arguments (2 issues)
  - switch-exhaustiveness-check (1 issues)
  - prefer-promise-reject-errors (1 issues)
  - no-unnecessary-boolean-literal-compare (1 issues)
  - no-implied-eval (1 issues)

## Thanks

- [Biome](https://biomejs.dev) : super fast linter & formatter
- [Boxy Svg](https://boxy-svg.com) : simple & effective svg editor
- [Bun](https://bun.sh) : super fast runtime for JavaScript and TypeScript
- [Github](https://github.com) : for all their great work year after year, pushing OSS forward
- [Oxc](https://oxc.rs) : a lovely super-fast collection of JavaScript tools written in Rust
- [React](https://react.dev) : great library for web and native user interfaces
- [Shields.io](https://shields.io) : for the nice badges on top of this readme
- [Svg Omg](https://jakearchibald.github.io/svgomg/) : the great king of svg file size reduction
- [TailwindCss](https://tailwindcss.com) : awesome lib to produce maintainable style
- [V8](https://github.com/demurgos/v8-coverage) : simple & effective cli for code coverage
- [Vite](https://github.com/vitejs/vite) : super fast frontend tooling
- [Vitest](https://github.com/vitest-dev/vitest) : super fast vite-native testing framework
- [Zod](https://github.com/colinhacks/zod) : typeScript-first schema validation

## Page views

[![Views Counter](https://views-counter.vercel.app/badge?pageId=Shuunen%2Fmonorepo&leftColor=5c5c5c&rightColor=07a62f&type=total&label=Visitors&style=none)](https://github.com/Kumara2mahe/Views-Counter)

![demo](docs/empty.svg)
