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
- [ ] investigate why nx is displaying : ✖  nx run sample-web-app:preview
- [ ] add knip (does it works with monorepo ?)
- [ ] investigate why we need local dependencies like react in utils when react is already in the root package.json, in the other hand apps/sample-web-app works without local react dependency
- [ ] investigate why cant we use tsgo considering the fact that the [official doc](https://github.com/microsoft/typescript-go) says it's done
- [ ] Add optional handling on form-field-field-list component, array level

## Thanks

- [Biome](https://biomejs.dev) : super fast linter & formatter
- [Boxy Svg](https://boxy-svg.com) : simple & effective svg editor
- [Bun](https://bun.sh) : super fast runtime for JavaScript and TypeScript
- [Github](https://github.com) : for all their great work year after year, pushing OSS forward
- [Oxc](https://oxc.rs) : a lovely super-fast collection of JavaScript tools written in Rust
- [React](https://react.dev) : great library for web and native user interfaces
- [Repo-checker](https://github.com/Shuunen/repo-checker) : eslint cover /src code and this tool the rest ^^
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
