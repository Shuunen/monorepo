import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "vitest";
import { fileToBase64 } from "./browser-file-to-base64.js";
import { Result } from "./result.js";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

describe(fileToBase64, () => {
  it("should convert successfully", async () => {
    const base64 = await fileToBase64(new File(["some data"], "file.jpg"));
    const result = Result.unwrap(base64);
    expect(result.value).toMatchInlineSnapshot(`"data:application/octet-stream;base64,c29tZSBkYXRh"`);
  });
});
