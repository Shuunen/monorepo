import { beforeEach, describe, expect, it, vi } from "vitest";

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
    if (!result.ok) {
      expect(result.error).toMatchInlineSnapshot('"missing header argument"');
    }
  });

  it("main B should inject header into files without header", async () => {
    vi.mocked(glob.default).mockResolvedValue(["a.ts", "b.ts"]);
    vi.mocked(fs.readFileSync).mockImplementation((...args: unknown[]) => mockFileContent(args[0] as string));
    const writeSpy = vi.mocked(fs.writeFileSync);
    const result = await mod.main(["node", "script", "--header=HEADER"]);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const { hasHeader, noHeader, moveHeader, nbFixed } = result.value;
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
    if (!result.ok) {
      return;
    }
    const { readError, noHeader, writeError, nbFixed } = result.value;
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
    if (!result.ok) {
      return;
    }
    const { readError, noHeader, nbFixed } = result.value;
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
    if (!result.ok) {
      return;
    }
    const { hasHeader, noHeader, moveHeader, nbFixed } = result.value;
    expect(hasHeader, "B hasHeader").toBe(1);
    expect(noHeader, "B noHeader").toBe(0);
    expect(moveHeader, "B moveHeader").toBe(1);
    expect(nbFixed, "B nbFixed").toBe(0);
    expect(writeSpy).toHaveBeenCalledWith("c.ts", "// HEADER\nconsole.log(3);");
  });

  it("report A should generate correct report string", () => {
    const metrics = {
      hasHeader: 1,
      moveHeader: 6,
      nbFixed: 2,
      noHeader: 3,
      readError: 4,
      writeError: 5,
    };
    const report = mod.report(metrics);
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files with header : [32m1[39m
        - Files with header misplaced: [32m6[39m
        - Files without header : [33m3[39m
        - Files fixed : [32m2[39m
        - Files read errors : [31m4[39m
        - Files write errors : [31m5[39m"
    `);
  });

  it("report B should handle zero metrics gracefully", () => {
    const metrics = {
      hasHeader: 0,
      moveHeader: 0,
      nbFixed: 0,
      noHeader: 0,
      readError: 0,
      writeError: 0,
    };
    const report = mod.report(metrics);
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files with header : [90m0[39m
        - Files with header misplaced: [90m0[39m
        - Files without header : [90m0[39m
        - Files fixed : [90m0[39m
        - Files read errors : [90m0[39m
        - Files write errors : [90m0[39m"
    `);
  });
});
