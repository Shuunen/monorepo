/** biome-ignore-all lint/nursery/noFloatingPromises: it's a test file */
import { expectTypeOf } from "vitest";
import { debounce } from "./debounce.js";
import { expectEqualTypes } from "./expect-type.js";
import { sleep } from "./sleep.js";

let times = 0;

/**
 * @returns the number of times the function has been called
 */
function myFunction() {
  times += 1;
  return times;
}

const myFunctionDebounced = debounce(myFunction, 5);

/**
 * @returns the number of times the function has been called after 5ms
 */
async function myAsyncFunction() {
  await sleep(5);
  times += 1;
  return times;
}

const myAsyncFunctionDebounced = debounce(myAsyncFunction, 5);

it("debounce A : sync function", async () => {
  times = 0;
  expect(times, "before any call, time : 0ms").toBe(0);
  myFunctionDebounced();
  myFunctionDebounced();
  myFunctionDebounced();
  await sleep(1);
  expect(times, "after 3 successive calls, time : 1ms").toBe(0);
  await sleep(6);
  expect(times, "after sleep should have fired, time : 7ms").toBe(1);
  await sleep(3);
  expect(times, "after even more sleep should not have fired again, time : 10ms").toBe(1);
});

// flaky test, disabled for now
// it("debounce B : async function", async () => {
//   times = 0;
//   expect(times, "before any call, time : 0ms").toBe(0);
//   myAsyncFunctionDebounced();
//   myAsyncFunctionDebounced();
//   myAsyncFunctionDebounced();
//   await sleep(1);
//   expect(times, "after 3 successive calls, time : 1ms").toBe(0);
//   await sleep(3);
//   expect(times, "after first sleep should not have fired yet, time : 4ms").toBe(0);
//   await sleep(8);
//   expect(times, "after enough time for debounce + async execution, time : 12ms").toBe(1);
// });

it("debounce C : return type", () => {
  expectTypeOf(myFunctionDebounced).toBeFunction();
});

it("debounce D : return type sync", () => {
  expect(Object.prototype.toString.call(myFunctionDebounced)).toBe("[object AsyncFunction]");
});

// flaky test, disabled for now
// it("debounce E : return type sync resolve", async () => {
//   times = 42;
//   expect(await myFunctionDebounced()).toBe(43);
// });

it("debounce F : return type async", () => {
  expect(Object.prototype.toString.call(myAsyncFunctionDebounced)).toBe("[object AsyncFunction]");
});

it("debounce G : return type async resolve", async () => {
  times = 42;
  expect(await myAsyncFunctionDebounced()).toBe(43);
});

it("debounce H : return types", async () => {
  expectEqualTypes(await myAsyncFunction(), await myAsyncFunctionDebounced());
});
