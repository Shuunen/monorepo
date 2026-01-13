# Stats

## TypeScript Tsc vs TsGo

For typecheck using TypeScript/Tsc :

`rm apps/stuff-finder/dist -rf && rm apps/stuff-finder/out-tsc/ -rf && hyperfine 'nx run stuff-finder:typecheck --skip-nx-cache' --runs 1`

For ts-check using TypeScript native / TsGo :

`rm apps/stuff-finder/dist -rf && rm apps/stuff-finder/out-tsc/ -rf && hyperfine 'nx run stuff-finder:
ts-check --skip-nx-cache' --runs 1`

| task                   | duration |
| ---------------------- | -------- |
| components:typecheck   | 9.3s     |
| components:ts-check    | 5.8s     |
| ---------------------- | -------- |
| stuff-finder:typecheck | 14.5s    |
| stuff-finder:ts-check  | 7.3s     |

## Various

Some tasks recently run in the monorepo on 2025-12-04 :

| task                         | duration |
| ---------------------------- | -------- |
| jozzo:build                  | 12.8s    |
| vet-web:build                | 12.5s    |
| recipes:build                | 11.3s    |
| components:build             | 7.2s     |
| stuff-finder:build           | 6.6s     |
| sample-web-app:build         | 5.7s     |
| image-compare:build          | 5.1s     |
| what-now:build               | 4.9s     |
| regex-converter:build        | 4.4s     |
| vite-plugins:build           | 45ms     |
| ---------------------------- | -------- |
| components:build-storybook   | 21.7s    |
| sample-web-app-e2e:e2e       | 3.2s     |
| utils:list                   | 528ms    |
| components:list              | 105ms    |
| user-scripts:lint            | 96ms     |
| ---------------------------- | -------- |
| utils:test                   | 8.2s     |
| recipes:test                 | 4.6s     |
| image-compare:test           | 3.7s     |
| regex-converter:test         | 3.6s     |
| vet-web:test                 | 3.4s     |
| jozzo:test                   | 3.2s     |
| sample-web-app:test          | 3.0s     |
| components:test              | 2.9s     |
| what-now:test                | 2.8s     |
| stuff-finder:test            | 2.3s     |
| user-scripts:test            | 1.2s     |
| one-file:test                | 1.2s     |
| config-sync:test             | 1.1s     |
