import { alignForSnap, Result } from "@monorepo/utils";

const mockFiles = [
  "atoms/Button.tsx",
  "atoms/index.ts",
  "atoms/types.ts",
  "atoms/types.d.ts",
  "icons/Icon.tsx",
  "molecules/Card.tsx",
  "molecules/Card.test.tsx",
  "molecules/Card.stories.tsx",
];

describe("barrel-maker cli", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock(import("tiny-glob"), () => ({ default: vi.fn<() => Promise<string[]>>().mockResolvedValue(mockFiles) }));
    vi.doMock(import("node:fs"), () => ({ writeFileSync: vi.fn<() => void>() }));
  });

  it("make A ext empty and default index.ts", async () => {
    const { make } = await import("./barrel-maker.cli.ts");
    const { value } = await make({ ext: "", header: "// Copyright ACME\n", target: "./{atoms,icons,molecules}/*.tsx" });
    expect(value.content).toMatchSnapshot();
    expect(value.files).toMatchSnapshot();
    expect(alignForSnap(value.out)).toContain(`libs/utils/index.ts`);
  });

  it("make B index.js and ext .js", async () => {
    const { make } = await import("./barrel-maker.cli.ts");
    const { value } = await make({
      ext: ".js",
      header: "// Copyright ACME\n",
      index: "index.js",
      target: "./lib/*.ts",
    });
    expect(value.content).toMatchSnapshot();
    expect(value.files).toMatchSnapshot();
    expect(alignForSnap(value.out)).toContain(`libs/utils/index.js`);
  });

  it("make C undefined ext", async () => {
    const { make } = await import("./barrel-maker.cli.ts");
    const { value } = await make({
      ext: undefined,
      target: "./{atoms,icons,molecules}/*.tsx",
    });
    expect(value.content).toMatchSnapshot();
    expect(value.files).toMatchSnapshot();
    expect(alignForSnap(value.out)).toContain(`libs/utils/index.ts`);
  });

  it("main A missing target", async () => {
    const { main } = await import("./barrel-maker.cli.ts");
    const { error } = Result.unwrap(await main(["node", "script.ts"]));
    expect(error).toMatchInlineSnapshot(`"missing target argument"`);
  });

  it("main B with args", async () => {
    const { main } = await import("./barrel-maker.cli.ts");
    const { value } = Result.unwrap(
      await main([
        "node",
        "script.ts",
        "--target=./{atoms,icons,molecules}/*.tsx",
        "--ext=.js",
        "--header=ACME",
        "--index=index.js",
      ]),
    );
    expect(value?.content).toMatchSnapshot();
    expect(value?.files).toMatchSnapshot();
    expect(alignForSnap(value?.out)).toContain(`libs/utils/index.js`);
  });

  it("main C without header", async () => {
    const { main } = await import("./barrel-maker.cli.ts");
    const { value } = Result.unwrap(
      await main(["node", "script.ts", "--target=./{atoms,icons,molecules}/*.tsx", "--ext=.js", "--index=index.js"]),
    );
    expect(value?.content).toMatchSnapshot();
    expect(value?.files).toMatchSnapshot();
    expect(alignForSnap(value?.out)).toContain(`libs/utils/index.js`);
  });
});
