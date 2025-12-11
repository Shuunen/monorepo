import { alignForSnap, Result } from "@monorepo/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFiles = ["atoms/Button.tsx", "atoms/types.ts", "atoms/types.d.ts", "icons/Icon.tsx", "molecules/Card.tsx", "molecules/Card.test.tsx", "molecules/Card.stories.tsx"];

describe("barrel-maker cli", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("tiny-glob", () => ({ default: vi.fn().mockResolvedValue(mockFiles) }));
    vi.doMock("node:fs", () => ({ writeFileSync: vi.fn() }));
  });

  it("make A ext empty and default index.ts", async () => {
    // @ts-expect-error import issue
    const { make } = await import("./barrel-maker.cli");
    const { value } = await make({ ext: "", header: "// Copyright ACME\n", target: "./{atoms,icons,molecules}/*.tsx" });
    expect(value.content).toMatchSnapshot();
    expect(value.files).toMatchSnapshot();
    expect(alignForSnap(value.out)).toContain(`libs/utils/index.ts`);
  });

  it("make B index.js and ext .js", async () => {
    // @ts-expect-error import issue
    const { make } = await import("./barrel-maker.cli");
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
    // @ts-expect-error import issue
    const { make } = await import("./barrel-maker.cli");
    const { value } = await make({
      ext: undefined,
      target: "./{atoms,icons,molecules}/*.tsx",
    });
    expect(value.content).toMatchSnapshot();
    expect(value.files).toMatchSnapshot();
    expect(alignForSnap(value.out)).toContain(`libs/utils/index.ts`);
  });

  it("main A missing target", async () => {
    // @ts-expect-error import issue
    const { main } = await import("./barrel-maker.cli");
    const { error } = Result.unwrap(await main(["node", "script.ts"]));
    expect(error).toMatchInlineSnapshot(`"missing target argument"`);
  });

  it("main B with args", async () => {
    // @ts-expect-error import issue
    const { main } = await import("./barrel-maker.cli");
    const { value } = Result.unwrap(await main(["node", "script.ts", "--target=./{atoms,icons,molecules}/*.tsx", "--ext=.js", "--header=ACME", "--index=index.js"]));
    // @ts-expect-error import issue
    expect(value?.content).toMatchSnapshot();
    // @ts-expect-error import issue
    expect(value?.files).toMatchSnapshot();
    // @ts-expect-error import issue
    expect(alignForSnap(value?.out)).toContain(`libs/utils/index.js`);
  });

  it("main C without header", async () => {
    // @ts-expect-error import issue
    const { main } = await import("./barrel-maker.cli");
    const { value } = Result.unwrap(await main(["node", "script.ts", "--target=./{atoms,icons,molecules}/*.tsx", "--ext=.js", "--index=index.js"]));
    // @ts-expect-error import issue
    expect(value?.content).toMatchSnapshot();
    // @ts-expect-error import issue
    expect(value?.files).toMatchSnapshot();
    // @ts-expect-error import issue
    expect(alignForSnap(value?.out)).toContain(`libs/utils/index.js`);
  });
});
