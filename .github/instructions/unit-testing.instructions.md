# Unit testing Instructions

This document provides instructions for unit testing in the project. It includes guidelines on how to write tests, run them, and interpret results.

## Running Tests

To run every possible unit tests in the monorepo, use the following command:

```bash
nx run-many -t test
``` 

To run tests for a specific project, use:

```bash
nx test <project-name>
```

You can also update the snapshot tests by adding the `--update` flag:

```bash
nx test <project-name> --update
```

## Interpreting command output

When you run the tests, you will see output in the terminal. The output will include :

- the number of tests run
- the number of tests that passed
- the number of tests that failed
- the duration of the test run
- the coverage report

### Example 1 : file not covered by tests

Let's say you run the tests and you get the following output :

```text
Test Files  6 passed (6)
Tests  101 passed (101)
Start at  21:06:59
Duration  649ms (transform 328ms, setup 0ms, collect 793ms, tests 74ms, environment 2ms, prepare 762ms)

% Coverage report from v8
---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |   87.13 |     99.5 |   97.72 |   87.13 |                  
 clean-trackers.cli.js           |       0 |        0 |       0 |       0 |                  
 clean-trackers.test.ts          |     100 |      100 |     100 |     100 |                  
 clean-trackers.utils.js         |     100 |      100 |     100 |     100 |                  
 dash-button.js                  |       0 |        0 |       0 |       0 | 1-174                 
 eslint-cleaner.cli.ts           |       0 |        0 |       0 |       0 |
---------------------------------|---------|----------|---------|---------|-------------------
ERROR: Coverage for lines (87.13%) does not meet global threshold (100%)
ERROR: Coverage for functions (97.72%) does not meet global threshold (100%)
ERROR: Coverage for statements (87.13%) does not meet global threshold (100%)
ERROR: Coverage for branches (99.5%) does not meet global threshold (100%)
Warning: command "vitest --coverage=true --coverage.thresholds.100=true" exited with non-zero status code
```

On this report we can see : 

1. The `clean-trackers.cli.js` and `eslint-cleaner.cli.ts` files are not covered by any tests, as indicated by the 0% coverage across all metrics. But because there is no "Uncovered Line" it means that the coverage is not enforced for these files. Nothing to do here.
2. The `clean-trackers.test.ts` and `clean-trackers.utils.js` files are fully covered by tests, with 100% coverage across all metrics. Nothing to do here.
3. The `dash-button.js` file has 0% coverage, with all lines uncovered, indicating that no tests are written for this file. The uncovered lines are from 1 to 174, which means the entire file is not tested. You should write tests for this file to improve coverage to 100%.
4. The overall coverage report shows that the project does not meet the global coverage thresholds. This means that you need to improve the coverage of your tests to meet the thresholds.


## Example 2 : file partially covered

Let's say you run the tests and you get the following output :

```text
✓ clean-ytdl.cli.test.ts (29 tests) 20ms

Test Files  7 passed (7)
    Tests  130 passed (130)
  Start at  10:11:43
  Duration  732ms (transform 483ms, setup 0ms, collect 1.17s, tests 94ms, environment 1ms, prepare 967ms)

% Coverage report from v8
---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------|---------|----------|---------|---------|-------------------
All files                        |     100 |    99.65 |     100 |     100 |                  
 clean-ytdl.cli.test.ts          |     100 |      100 |     100 |     100 |                  
 clean-ytdl.cli.ts               |     100 |    97.14 |     100 |     100 | 34                   
---------------------------------|---------|----------|---------|---------|-------------------
ERROR: Coverage for branches (99.65%) does not meet global threshold (100%)
Warning: command "vitest --coverage=true --coverage.thresholds.100=true" exited with non-zero status code
```

In this report, we can see :

1. The `clean-ytdl.cli.test.ts` file is fully covered by tests, with 100% coverage across all metrics. Nothing to do here.
2. The `clean-ytdl.cli.ts` file has 100% coverage for statements, functions, and lines, but only 97.14% coverage for branches. This means that there are some branches in the code that are not covered by tests. The uncovered line is line 34, which indicates that there is a branch in the code that is not tested. You should write tests for this branch to improve the coverage to 100%.
3. The overall coverage report shows that the project does not meet the global coverage threshold for branches. This means that you need to improve the coverage of your tests to meet the thresholds.

## Writing Tests

When writing tests, follow these guidelines :

- Use the `vitest` testing framework, which is already set up in the project.
- Write tests in the `*.test.ts` files corresponding to the files you are testing. For example, if you are testing the `my-file.cli.ts` file, write your tests in the `my-file.test.ts` file. If you are testing the `my-file.utils.ts` file, also write your tests in the `my-file.test.ts` file.
- Use the `describe` and `it` functions to organize your tests. The `describe` function is used to group tests for a file or group of files like `describe('my-file', () => { ... })`, and the `it` function is used to define individual test cases. Each test case description start with the name of the function being tested, followed by a single and unique letter in capital that automatically increase after each test case of the same function, like `it('myFunc A should convert foo into bar', () => { ... })`, `it('myFunc B should convert bar into foo', () => { ... })`, `it('myFunc C should throw an error when input is invalid', () => { ... })`, `it('anotherFunction A should return the correct value when input is valid', () => { ... })`, etc.
- Use the `expect` function to assert the expected behavior of your code. For example, `const result = myFunction(input); expect(result).toMatchInlineSnapshot(`"expected output"`);` to check that the output of the function matches the expected output. Use `toMatchInlineSnapshot` most of the time to ensure that the output is correct and to avoid having to manually update the tests when the output changes. If you really need to check for specific values that will never change, use `toBe`, `toEqual`, or other matchers provided by `vitest`.
- Use only one global `describe` per test file.
- Use `beforeEach` and `afterEach` hooks to set up and clean up any necessary state before and after each test case. This is useful for resetting any global state or mocking dependencies.
- Use `vi.mock` to mock any dependencies that are not directly related to the code being tested. This allows you to isolate the code being tested and avoid any side effects from external dependencies.
