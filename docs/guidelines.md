# Guidelines

- [Guidelines](#guidelines)
  - [General](#general)
    - [React-queries](#react-queries)
    - [Stores](#stores)
    - [Schemas](#schemas)
    - [Assets](#assets)
    - [PR review process](#pr-review-process)
    - [Changelog](#changelog)
  - [Components](#components)
    - [File casing](#file-casing)
    - [Separation between routes and components](#separation-between-routes-and-components)
    - [Where to put components](#where-to-put-components)
    - [Atomic design](#atomic-design)
    - [Atomic design alignment](#atomic-design-alignment)
  - [Typescript](#typescript)
    - [Named functions / arrow functions ?](#named-functions--arrow-functions-)
    - [Boolean naming](#boolean-naming)
    - [Enums](#enums)
  - [Front-end / back-end integration](#front-end--back-end-integration)
    - [Status codes](#status-codes)
    - [Enforce HTTP status code](#enforce-http-status-code)
    - [Enforce proper HTTP methods](#enforce-proper-http-methods)
    - [Ensure that mocks are more robust](#ensure-that-mocks-are-more-robust)
  - [Testing](#testing)
    - [Function, utils, .ts files](#function-utils-ts-files)
    - [Components, .tsx files](#components-tsx-files)

## General

### React-queries

All the queries live in the `/apps/<app>/src/api/` folder of the app.

The file can contain several queries and mutations, as long as they are related to the same API endpoint:

`use-records.api.ts`:

- `useRecordRetrieve()`
- `useRecordUpdate()`
- `useRecordDelete()`

TODO: ??? handlers (display toast when error, authentication timeout needed to refresh the token etc...)

### Stores

Stores must be created in the stores folder: ex: `/apps/<app>/src/stores/notifications.store.ts`, `/apps/<app>/src/stores/use-downloads.store.ts`.

Each store can also export a hook (ex: `useDownloadsStore()`).

Stores must be unit tested.

### Schemas

Schemas should be put in the `/apps/<app>/src/schemas/` folder and should follow the `xxx.schema.ts` convention.

They should export a function following the `xxxSchema` naming convention.

### Assets

All assets (images etc) must live in the `/apps/<app>/src/assets/` folder.
Generic icons should live in the /libs/components/icons.
Do not import lucide (or other) icons directly in the apps (or components). Just use imports from the /libs. If you need a new icon, add it to the /libs.

### PR review process

1 enforced reviewers/approvals, but ideally 2 is the minimum needed for merging the PR. Always add Romain and Nicolas as a reviewer.
Branch naming and Commit message formats are enforced:
Branch name examples:
feature/JIRA-1234-the-name-of-the-feature
hotfix/JIRA-4567-fix-for-issue
Commit examples:
JIRA-1234 Your description here
JIRA-1234 feat(notification): add navbar
JIRA-1234 fix(notification): improve spacing
JIRA-1234 chore(app-webui): update ShadCn components
JIRA-1234 docs(guidelines): add initial document

Note : these are called [conventional commit](https://www.conventionalcommits.org/)

### Changelog

At the moment, the changelog needs to be updated manually. Provide a meaningful description for the PR, that ca be useful for testers to understand what is available to test.
If another PR gets merged before yours, make sure to increase the changelog version manually.
In the future, it would be nice to have automated generation.

## Components

### File casing

All the files needs to follow the `kebab-case-convention.ts`

### Separation between routes and components

The `routes` folder only contains the pages, no components, no hooks etc.

### Where to put components

`apps/`: components specific to an app

`libs/components`: common code between the apps

### Atomic design

atoms: libs/components

molecules & organisms: app specific components (not shared with other apps)

- apps/sample-webui/src/components/molecules/navbar.tsx -> `<Navbar />`
- apps/sample-webui/src/components/organisms/notifications-navbar.tsx -> `<NotificationsNavbar />`
- apps/sample-webui/src/components/organisms/notifications-pagination.tsx -> `<NotificationsPagination />`
- libs/components/molecules/navbar.tsx -> Generic component re-usable by other apps

The component name must be the same as the file name (`my-component.tsx` -> `<MyComponent />`)

Is it an organism?

Like a molecule with business logic.

- molecules: no interaction outside of the component (MsRefNumberInput)
- organism: has some integration with the world outside of the component or some business logic (ex: NotificationsNavbar that is using some react-queries).

Components only interact with the outside world through props, they must be dumb and testable in isolation (ex: no api calls)

### Atomic design alignment

When you work with components which are misplaced, feel free to move them per the recommendation above, as this is an ongoing effort.

## Typescript

types vs interface ? types

type naming ? prefix or not
TNavbar
NavbarProps <
TNavbarProps

### Named functions / arrow functions ?

bad :

```ts
myArray.sort((a,b) => {
  const ...
  return ...
})
```

good :

```ts
export function byAge(personA, personB) {
  const ...
  return ...
}

myArray.sort(byAge)
```

accepted :

```ts
const value = await fetch(url).then((response) => response.json());
```

null / undefined is preferred

truthy / falsy handling

### Boolean naming

prefer isSomething/hasSomething/canDoThat

funnel approach naming : from generic to specific, what is wrapping what ?

- bad : maxItemsNavbar itemsInCart
- good : navbarMaxItems cartItems

### Enums

Prefer `as const` object` to enums. Use camelCase for the variable name and keys.

```ts
export const asyncJobStatus = {
  error: 3,
  pending: 0,
  ready: 2,
} as const;
```

Store the constants that need to be shared in `apps/<app>/src/constants`.

## Front-end / back-end integration

### Status codes

Back-end should return string constants codes instead of human strings

- bad : `{"status": "Pending Confirmation"}`
- good : `{"status": "PENDING"}`

Status returned should be string constants instead of codes

- bad : `{ code: 0001 }`
- good : `{ code: "INVALID" }`

### Enforce HTTP status code

- bad: HTTP 200 : `{results: []}`
- good: HTTP 404

### Enforce proper HTTP methods

Don't use POST for everything, use PUT when relevant

### Ensure that mocks are more robust

Extend mock data provided, in order to be able to implement/test features such as pagination?

## Testing

### Function, utils, .ts files

- write unit tests
- don't test external dependencies
- we try to reach 100% coverage on files
- exclude files if they are not relevant (exclude them from sonar.properties as well)

More details on unit-testing in the [dedicated doc](./unit-testing.md).

### Components, .tsx files

Each component should have a Story, with :

- every use case
- interaction testing on at least one use case (the `play` function)
