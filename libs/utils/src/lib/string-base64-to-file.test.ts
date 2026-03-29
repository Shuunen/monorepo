import { Result } from "./result.js";
import { base64ToFile } from "./string-base64-to-file.js";

describe(base64ToFile, () => {
  it("A should convert successfully", () => {
    const base64GifString = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "file.gif"));
    expect(result.value instanceof File).toBe(true);
    expect(result.value?.name).toBe("file.gif");
  });

  it("B bad format, should not encode", () => {
    const base64GifString = "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "file.gif"));
    expect(result.error).toMatchInlineSnapshot(`"Invalid base64 string format."`);
  });

  it("C missing extension in filename", () => {
    const base64GifString = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "file"));
    expect(result.error).toMatchInlineSnapshot(`"Missing extension in the filename."`);
  });

  it("D missing extension in filename on purpose", () => {
    const base64GifString = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    const result = Result.unwrap(base64ToFile(base64GifString, "foobar", false));
    expect(result.value instanceof File).toBe(true);
    expect(result.value?.name).toBe("foobar");
  });
});
