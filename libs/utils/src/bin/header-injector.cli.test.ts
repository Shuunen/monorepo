import { beforeEach, describe, expect, it, vi } from "vitest";
import { invariant } from "es-toolkit";

vi.mock("tiny-glob");
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const glob = await import("tiny-glob");
const fs = await import("node:fs");
const mod = await import("./header-injector.cli.js");

function mockFileContent(path: string): string {
  if (path === "a.ts") {
    return "// HEADER\nconsole.log(1)";
  }
  if (path === "c.ts") {
    return "console.log(3);\n// HEADER";
  }
  return "console.log(2)";
}

describe("header-injector.cli.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("main A should return error when missing header argument", async () => {
    const result = await mod.main(["node", "script"]);
    expect(result.ok).toBe(false);
    invariant(!result.ok, "expected result to be error");
    expect(result.error).toMatchInlineSnapshot('"missing header argument"');
  });

  it("main B should inject header into files without header", async () => {
    vi.mocked(glob.default).mockResolvedValue(["a.ts", "b.ts"]);
    vi.mocked(fs.readFileSync).mockImplementation((...args: unknown[]) => mockFileContent(args[0] as string));
    const writeSpy = vi.mocked(fs.writeFileSync);
    const result = await mod.main(["node", "script", "--header=HEADER"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { hasHeader, noHeader, moveHeader, addedHeader: nbFixed } = result.value;
    expect(hasHeader, "B hasHeader").toBe(1);
    expect(noHeader, "B noHeader").toBe(1);
    expect(moveHeader, "B moveHeader").toBe(0);
    expect(nbFixed, "B nbFixed").toBe(1);
    expect(writeSpy).toHaveBeenCalledWith("b.ts", "// HEADER\nconsole.log(2)");
  });

  it("main C should count skipped when write fails", async () => {
    vi.mocked(glob.default).mockResolvedValue(["c.ts"]);
    vi.mocked(fs.readFileSync).mockReturnValue("console.log(3)");
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error("disk full");
    });
    const result = await mod.main(["node", "script", "--header=// NEW"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { readError, noHeader, writeError, addedHeader: nbFixed } = result.value;
    expect(noHeader, "C noHeader").toBe(1);
    expect(nbFixed, "C nbFixed").toBe(0);
    expect(readError, "C readError").toBe(0);
    expect(writeError, "C writeError").toBe(1);
  });

  it("main D should count readError when read fails", async () => {
    vi.mocked(glob.default).mockResolvedValue(["d.ts"]);
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("permission denied");
    });
    const result = await mod.main(["node", "script", "--header=// NEW"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { readError, noHeader, addedHeader: nbFixed } = result.value;
    expect(readError, "D readError").toBe(1);
    expect(noHeader, "D noHeader").toBe(0);
    expect(nbFixed, "D nbFixed").toBe(0);
  });

  it("main E should move header into files with header not on the first line", async () => {
    vi.mocked(glob.default).mockResolvedValue(["a.ts", "c.ts"]);
    vi.mocked(fs.readFileSync).mockImplementation((...args: unknown[]) => mockFileContent(args[0] as string));
    const writeSpy = vi.mocked(fs.writeFileSync);
    const result = await mod.main(["node", "script", "--header=HEADER"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { hasHeader, noHeader, moveHeader, addedHeader: nbFixed } = result.value;
    expect(hasHeader, "B hasHeader").toBe(1);
    expect(noHeader, "B noHeader").toBe(0);
    expect(moveHeader, "B moveHeader").toBe(1);
    expect(nbFixed, "B nbFixed").toBe(0);
    expect(writeSpy).toHaveBeenCalledWith("c.ts", "// HEADER\nconsole.log(3);");
  });

  it("main F should remove header from files when --remove flag is passed", async () => {
    vi.mocked(glob.default).mockResolvedValue(["a.ts", "b.ts"]);
    vi.mocked(fs.readFileSync).mockImplementation((...args: unknown[]) => mockFileContent(args[0] as string));
    const writeSpy = vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    const result = await mod.main(["node", "script", "--remove"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { removedHeader, noHeader } = result.value;
    expect(noHeader, "F noHeader").toBe(1);
    expect(removedHeader, "F removedHeader").toBe(1);
    expect(writeSpy).toHaveBeenCalledWith("a.ts", "console.log(1)");
  });

  it("main G should handle files without header in remove mode", async () => {
    vi.mocked(glob.default).mockResolvedValue(["b.ts"]);
    vi.mocked(fs.readFileSync).mockReturnValue("console.log(2)");
    const writeSpy = vi.mocked(fs.writeFileSync);
    const result = await mod.main(["node", "script", "--remove"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { removedHeader, noHeader } = result.value;
    expect(removedHeader, "G removedHeader").toBe(0);
    expect(noHeader, "G noHeader").toBe(1);
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it("main H should handle write errors in remove mode", async () => {
    vi.mocked(glob.default).mockResolvedValue(["a.ts"]);
    vi.mocked(fs.readFileSync).mockReturnValue("// HEADER\nconsole.log(1)");
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error("disk full");
    });
    const result = await mod.main(["node", "script", "--remove"]);
    expect(result.ok).toBe(true);
    invariant(result.ok, "expected result to be ok");
    const { removedHeader, writeError } = result.value;
    expect(removedHeader, "H removedHeader").toBe(0);
    expect(writeError, "H writeError").toBe(1);
  });

  it("report A should generate correct report string", () => {
    const metrics = {
      addedHeader: 2,
      hasHeader: 1,
      moveHeader: 6,
      noHeader: 3,
      readError: 4,
      removedHeader: 7,
      writeError: 5,
    };
    const report = mod.report(metrics);
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files without header : [33m3[39m
        - Files with header : [32m1[39m
        - Files with header misplaced: [32m6[39m
        - Files with header added : [32m2[39m
        - Files with header removed : [32m7[39m
        - Files read errors : [31m4[39m
        - Files write errors : [31m5[39m"
    `);
  });

  it("report B should handle zero metrics gracefully", () => {
    const metrics = {
      addedHeader: 0,
      hasHeader: 0,
      moveHeader: 0,
      noHeader: 0,
      readError: 0,
      removedHeader: 0,
      writeError: 0,
    };
    const report = mod.report(metrics);
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files without header : [90m0[39m
        - Files with header : [90m0[39m
        - Files with header misplaced: [90m0[39m
        - Files with header added : [90m0[39m
        - Files with header removed : [90m0[39m
        - Files read errors : [90m0[39m
        - Files write errors : [90m0[39m"
    `);
  });
});
