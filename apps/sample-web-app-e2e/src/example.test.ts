import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect title to contain a specific string
  expect(await page.locator("h1").textContent()).toContain("sample-web-app");
});
