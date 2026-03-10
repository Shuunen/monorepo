# FAQ

- [FAQ](#faq)
  - [Issues and errors](#issues-and-errors)
    - [OxLint is not working in VSCode](#oxlint-is-not-working-in-vscode)
    - [Cannot find module Vitest](#cannot-find-module-vitest)
  - [Formatter](#formatter)
  - [Shadcn](#shadcn)
    - [How to add a new component from the Shadcn library to the project ?](#how-to-add-a-new-component-from-the-shadcn-library-to-the-project-)
  - [Storybook](#storybook)
    - [How to run the storybook ?](#how-to-run-the-storybook-)
    - [Where should I put my story ?](#where-should-i-put-my-story-)

## Issues and errors

### OxLint is not working in VSCode

Sometimes oxlint cli works but the VSCode extension doesn't work.

First check the output of the extension and see if there is any error.

Sometimes the extension can also contains bugs like 1.49.0 and 1.49.1 that is unable to load the config (with the custom plugin) even when oxlint 1.49.0 (and above) works fine in the cli, in this case you can downgrade the extension to 1.48.0 and wait for the next release of the extension.

### Cannot find module Vitest

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
pnpm clean
nx run components:test
```

## Formatter

You can customize the actions done on save concerning the formatting,
Just go to the `User settings (JSON)` .

```json

"editor.codeActionsOnSave": {
    "source.addMissingImports.ts": "explicit",
    "source.fixAll.oxc": "explicit",
    "source.fixAll.ts": "explicit",
    "source.removeUnusedImports": "explicit"
  },

```

## Shadcn

### How to add a new component from the Shadcn library to the project ?

To import a new Shadcn component to the project use the command `pnpm add:shadcn foobar`. It will download the files from CLI Shadcn and move them to the right folder.

_For exemple: `pnpm add:shadcn calendar`._

## Storybook

Now all the stories from every project are shared in the same storybook. All the stories names are prefixed with the project name. All the stories in the `libs/components` folder are prefixed with `Commons`.

_For exemple: `Sample-Webapp/Atoms/Button`._

### How to run the storybook ?

You can either run the command: `nx run components:run-storybook` or directly run the task from the Nx Console / Command Palette > Run Task.

### Where should I put my story ?

Stories always stay with his component. Wherever there is your component is where your story must be.
