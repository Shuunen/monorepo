import { describe, expect, it } from "vitest";
import { Result } from "./result.js";
import { base64ToFile } from "./string-base64-to-file.js";

describe(base64ToFile, () => {
  it("should convert successfully", () => {
    const base64GifString = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "file"));
    expect(result.value instanceof File).toBe(true);
    expect(result.value?.name).toBe("file.gif");
  });

  it("should not encode", () => {
    const base64GifString = "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "file"));
    expect(result.error).toMatchInlineSnapshot(`"Failed to encode base64 string."`);
  });
});
