import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { injectStyles } from "./browser-inject-styles.js";
import { Result } from "./result.js";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

it("injectStyles A empty", () => {
  const result = Result.unwrap(injectStyles());
  expect(result.value).toBeUndefined();
  expect(result.error).toMatchInlineSnapshot(`"injectStyles : cannot inject empty styles"`);
});

it("injectStyles B url", () => {
  const result = Result.unwrap(injectStyles("https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"));
  expect(result.value).toMatchInlineSnapshot(
    `"injectStyles : injected <link> with url "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css""`,
  );
  expect(result.error).toBeUndefined();
});

it("injectStyles C css", () => {
  const result = Result.unwrap(injectStyles("body { background-color: red; }"));
  expect(result.value).toMatchInlineSnapshot(`"injectStyles : injected <style> with provided css"`);
  expect(result.error).toBeUndefined();
});
