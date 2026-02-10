import { hasOption, isVerbose } from "./flags.js";

// oxlint-disable-next-line prefer-structured-clone
const initialProcess = JSON.parse(JSON.stringify(process));

describe("flags", () => {
  afterEach(() => {
    process.argv = initialProcess.argv;
    process.env = initialProcess.env;
  });

  it("hasOption A has process", () => {
    expect(typeof process).toMatchInlineSnapshot(`"object"`);
  });

  it("hasOption B without argv & without env", () => {
    // @ts-expect-error type issue
    process.argv = undefined;
    // @ts-expect-error type issue
    process.env = undefined;
    expect(hasOption("verbose")).toMatchInlineSnapshot(`false`);
  });

  it("hasOption C with argv & without env", () => {
    process.argv = ["--verbose"];
    // @ts-expect-error type issue
    process.env = undefined;
    expect(hasOption("verbose")).toMatchInlineSnapshot(`true`);
  });

  it("hasOption D without argv & with env", () => {
    process.argv = [];
    process.env = { verbose: "true" };
    expect(hasOption("verbose")).toMatchInlineSnapshot(`true`);
  });

  it("hasOption E when process is undefined", () => {
    expect(hasOption("verbose", undefined)).toMatchInlineSnapshot(`false`);
  });

  it("hasOption F with env var as non-true string", () => {
    process.argv = [];
    process.env = { verbose: "false" };
    expect(hasOption("verbose")).toMatchInlineSnapshot(`false`);
  });

  it("hasOption G checks env var toString", () => {
    process.argv = [];
    // @ts-expect-error testing number value
    process.env = { verbose: 1 };
    expect(hasOption("verbose")).toMatchInlineSnapshot(`false`);
  });

  it("isVerbose A returns false by default", () => {
    process.argv = [];
    process.env = {};
    expect(isVerbose()).toMatchInlineSnapshot(`false`);
  });

  it("isVerbose B returns true with verbose flag", () => {
    process.argv = ["--verbose"];
    expect(isVerbose()).toMatchInlineSnapshot(`true`);
  });

  it("isVerbose C returns true with v flag", () => {
    process.argv = ["--v"];
    expect(isVerbose()).toMatchInlineSnapshot(`true`);
  });
});
