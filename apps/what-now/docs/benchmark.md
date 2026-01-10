# Benchmarks

## Eslint

`hyperfine --runs 3 --warmup 1 'npx eslint'`

|     date     |     delay     | node  |     machine      | comment                         |
| :----------: | :-----------: | :---: | :--------------: | ------------------------------- |
| 2025-02-05#1 | 5.1 s ± 0.1 s | 22.11 | romain duc win11 | eslint-plugin-shuunen 0.4.0 CJS |
| 2025-02-05#2 | 5.0 s ± 0.1 s | 22.11 | romain duc win11 | eslint-plugin-shuunen 1.0.0 ESM |
| 2025-05-04#1 | 5.0 s ± 0.1 s | 22.14 | romain duc win11 | eslint-plugin-shuunen 1.3.0 ESM |
