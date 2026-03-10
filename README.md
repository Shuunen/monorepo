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

- [ ] remove `explicit-module-boundary-types: off` from oxlint conf and declare types everywhere ?
- [ ] add knip (does it works with monorepo ?)
- [ ] investigate if we need to split output from tsc and build ( right now lib/app go to dist but tsconfig.spec goes to out-tsc)
- [ ] investigate why we need local dependencies like react in utils when react is already in the root package.json, in the other hand apps/sample-web-app works without local react dependency
- [ ] Add optional handling on form-field-field-list component, array level

## Performances

- [ ] check if splitting exports like in the business lib helps with performances or not
- [ ] check if we can merge typecheck with building ( we need to find a solution that can leverage ts-go ) ( or wait for typescript 7)

## OXC Rules to enable

Important rules to re-enable quickly :

- no-floating-promises : important for example when we forgot to await a promise (609 issues)
- no-unsafe-member-access (50 issues)

Nice to have rules to re-enable later :

- prefer-readonly-parameter-types : will be nice to have, not urgent (1421 issues)
- strict-boolean-expressions : nice to have, to avoid truthy/falsy assertions (161 issues)
- no-unsafe-type-assertion (165 issues)
- jsx-no-new-function-as-prop (98 issues)
- no-unnecessary-condition (88 issues)
- no-unsafe-assignment (58 issues)
- prefer-nullish-coalescing (48 issues)
- restrict-template-expressions (33 issues)

Nitpicks to re-enable one day :

- strict-void-return (133 issues)
- jsx-props-no-spreading (57 issues)
- jsx-no-new-object-as-prop (54 issues)
- no-misused-promises : seems like a duplicate about promise handling (23 issues)
- no-array-index-key : conflicts with useStableKeys (9 issues)
- jsx-handler-names (5 issues)

Nice to have as js-plugin :

- naming-convention : enforces naming conventions (camelCase, PascalCase, etc.) like it was in Biome

Make a dedicated PR to enable the jest oxlint plugin.

## Thanks

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
