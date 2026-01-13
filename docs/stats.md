# Stats

## TypeScript Tsc vs TsGo

For typecheck using TypeScript/Tsc :

- `rm apps/stuff-finder/dist apps/stuff-finder/out-tsc -rf && hyperfine 'nx run stuff-finder:typecheck --skip-nx-cache' --runs 1`
- `rm apps/vet-web/dist apps/vet-web/out-tsc -rf && hyperfine 'nx run vet-web:typecheck --skip-nx-cache' --runs 1`
- `rm libs/components/dist libs/components/out-tsc -rf && hyperfine 'nx run components:typecheck --skip-nx-cache' --runs 1`
- `rm libs/utils/dist libs/utils/out-tsc -rf && hyperfine 'nx run utils:typecheck --skip-nx-cache' --runs 1`

For ts-check using TypeScript native / TsGo :

- `rm apps/stuff-finder/dist apps/stuff-finder/out-tsc -rf && hyperfine 'nx run stuff-finder:ts-check --skip-nx-cache' --runs 1`
- `rm apps/vet-web/dist apps/vet-web/out-tsc -rf && hyperfine 'nx run vet-web:ts-check --skip-nx-cache' --runs 1`
- `rm libs/components/dist libs/components/out-tsc -rf && hyperfine 'nx run components:ts-check --skip-nx-cache' --runs 1`
- `rm libs/utils/dist libs/utils/out-tsc -rf && hyperfine 'nx run utils:ts-check --skip-nx-cache' --runs 1`

Protocol : run the tsc one then the ts-go one, each with a single run to avoid caching effects. Then keep doing one then the other until we have 3 measurements for each. Finally note the average.

| task                              | seconds |
| --------------------------------- | ------: |
| components:ts-check (Github CI)   |      14 |
| components:typecheck              |       9 |
| components:ts-check               |       4 |
| --------------------------------  | ------- |
| stuff-finder:typecheck            |      12 |
| stuff-finder:ts-check (Github CI) |       6 |
| stuff-finder:ts-check             |       5 |
| --------------------------------  | ------- |
| vet-web:typecheck                 |      11 |
| vet-web:ts-check                  |       5 |
| vet-web:ts-check (Github CI)      |       4 |
| --------------------------------  | ------- |
| utils:typecheck                   |       3 |
| utils:ts-check                    |     1.6 |
| utils:ts-check (Github CI)        |       1 |

Note 1 : Measurements done on 2026-01-13 on W11 LeDuc machine (AMD Ryzen 7 7800X3D, 64GB RAM, NVMe SSD)
Note 2 : [Github CI job](https://github.com/Shuunen/monorepo/actions/runs/20964951252/job/60252559800?pr=43)
Note 3 : Durations above 2 seconds are rounded to ease comparison

## Various

Some tasks recently run in the monorepo on 2025-12-04 :

`hyperfine 'nx run jozzo:build --skip-nx-cache' --runs 3`

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
