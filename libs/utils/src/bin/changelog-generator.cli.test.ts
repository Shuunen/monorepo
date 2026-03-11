import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { stringify } from "@monorepo/utils";
import {
  main,
  getHistory,
  getOutput,
  getFilters,
  parseSingleCommit,
  getReleaseVersion,
} from "./changelog-generator.cli.js";

// oxlint-disable-next-line arrow-body-style
const { mockFileSync, mockExecSync } = vi.hoisted(() => {
  return {
    mockFileSync: vi.fn(),
    mockExecSync: vi.fn(),
    mockGetAllHistory: vi.fn(),
    mockReadPackageJsonVersion: vi.fn(),
  };
});

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:fs", () => ({
  readFileSync: mockFileSync,
  writeFileSync: mockFileSync,
  default: { readFileSync: mockFileSync, writeFileSync: mockFileSync },
}));

// oxlint-disable-next-line vitest/prefer-import-in-mock
vi.mock("node:child_process", () => ({
  execSync: mockExecSync,
  default: { execSync: mockExecSync },
}));

describe("changelog-generator.cli.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // readPackageJsonVersion
  it("readPackageJsonVersion A should return the version when package.json is valid", () => {
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({
        name: "test",
        description: "Testing",
        scripts: {
          test: "npm test",
        },
        version: "1.2.3-alpha",
      }),
    );

    const result = getReleaseVersion();
    expect(result).toMatchInlineSnapshot(`"1.2.3-alpha"`);
  });

  it("readPackageJsonVersion B returns expected when package.json does not contain version ", () => {
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({
        name: "test",
        description: "Testing",
        scripts: {
          test: "npm test",
        },
      }),
    );

    const result = getReleaseVersion();
    expect(result).toMatchInlineSnapshot(`"no version found"`);
  });

  it("readPackageJsonVersion C returns expected when readFileSync throws", () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });
    const result = getReleaseVersion();
    expect(result).toMatchInlineSnapshot(`"failed to read package.json"`);
    vi.mocked(readFileSync).mockReset();
  });

  it("readPackageJsonVersion D returns expected when package.json is invalid JSON", () => {
    vi.mocked(readFileSync).mockReturnValue("not valid json");
    const result = getReleaseVersion();
    expect(result).toMatchInlineSnapshot(`"failed to parse package.json"`);
  });

  // parseSingleCommit
  const commits = [
    {
      id: "A",
      input: "0980312c|2025-11-11|FOO-123 Add feature X",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"Add feature X","ticket":"FOO-123"}',
    },
    {
      id: "B",
      input: "0980312c|2025-11-11|FOO-123 chore: cleanup Y (#673)",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"cleanup Y (#673)","ticket":"FOO-123"}',
    },
    {
      id: "C",
      input: "0980312c|2025-11-11|BAR-1234 Devops change Z",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"Devops change Z","ticket":"BAR-1234"}',
    },
    {
      id: "D",
      input: "0980312c|2025-11-11|Random change",
      output: "undefined",
    },
    {
      id: "E",
      input: "0980312c|2025-11-11|FOOBAR-722 : jojo-0.6.3-alpha",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"jojo-0.6.3-alpha","ticket":"FOOBAR-722"}',
    },
    {
      id: "F",
      input: "0980312c|2025-11-11|JI-321:jojo-0.8-alpha <3",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"jojo-0.8-alpha <3","ticket":"JI-321"}',
    },
    {
      id: "G",
      input: "0980312c|2025-11-11|FU-11 chore(super-scope): Add feature Foobar/Baz (#21)",
      output: '{"date":"2025-11-11","hash":"0980312c","message":"Add feature Foobar/Baz (#21)","ticket":"FU-11"}',
    },
  ];
  for (const { id, input, output } of commits) {
    it(`parseSingleCommit ${id} should return expected`, () => {
      const result = parseSingleCommit(input);
      expect(stringify(result)).toBe(output);
    });
  }

  // getHistory
  it("getHistory A should fetch git history and parse it", () => {
    const mockGitHistory = `0980312c|2025-11-11|FOO-123 Add feature X
    0980312c|2025-11-11|FOO-123 chore: cleanup Y
    0980312c|2025-11-11|BAR-1234 Devops change Z
    `;
    vi.mocked(execSync).mockReturnValue(mockGitHistory);
    const result = getHistory();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "Devops change Z",
          "ticket": "BAR-1234",
        },
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "cleanup Y",
          "ticket": "FOO-123",
        },
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "Add feature X",
          "ticket": "FOO-123",
        },
      ]
    `);
  });

  it("getHistory B should filter commits by single prefix", () => {
    const mockGitHistory = `0980312c|2025-11-11|FOO-123 Add feature X
0980312c|2025-11-11|BAR-1234 Devops change Z`;
    vi.mocked(execSync).mockReturnValue(mockGitHistory);
    const result = getHistory(["FOO"]);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "Add feature X",
          "ticket": "FOO-123",
        },
      ]
    `);
  });

  it("getHistory C should filter commits by multiple prefixes", () => {
    const mockGitHistory = `0980312c|2025-11-11|FOO-123 Add feature X
0980312c|2025-11-11|BAR-1234 Devops change Z
0980312c|2025-11-11|BAZ-99 Some other change`;
    vi.mocked(execSync).mockReturnValue(mockGitHistory);
    const result = getHistory(["FOO", "BAZ"]);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "Some other change",
          "ticket": "BAZ-99",
        },
        {
          "date": "2025-11-11",
          "hash": "0980312c",
          "message": "Add feature X",
          "ticket": "FOO-123",
        },
      ]
    `);
  });

  // generateChangeLogTsFile
  it("generateChangeLogTsFile A should write expected content to file", () => {
    const originalArgv = process.argv;
    process.argv = ["node", "changelog-generator.cli.ts", "--output=some/folder/file.gen.ts"];
    vi.mocked(execSync).mockReturnValue("0980312c|2025-11-11|FOO-123 Add feature X");
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: "1.2.3-alpha" }));
    main();
    expect(writeFileSync).toHaveBeenCalled();
    process.argv = originalArgv;
  });

  it("generateChangeLogTsFile B should write filtered content to file", () => {
    const originalArgv = process.argv;
    process.argv = ["node", "changelog-generator.cli.ts", "--output=some/folder/file.gen.ts", "--filter=FOO"];
    vi.mocked(execSync).mockReturnValue(
      "0980312c|2025-11-11|FOO-123 Add feature X\n0980312c|2025-11-11|BAR-1234 Devops change Z",
    );
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: "1.2.3-alpha" }));
    main();
    expect(writeFileSync).toHaveBeenCalled();
    process.argv = originalArgv;
  });

  // parseOutputArg
  it("parseOutputArg A should return the output path", () => {
    const result = getOutput(["--output=some/folder/file.gen.ts"]);
    expect(result).toMatchInlineSnapshot(`"some/folder/file.gen.ts"`);
  });
  it("parseOutputArg B should throw when no --output arg", () => {
    expect(() => getOutput(["--other=value"])).toThrowErrorMatchingInlineSnapshot(
      `[Error: Usage: changelog-generator.cli.ts --output=<path>]`,
    );
  });

  // getFilters
  it("getFilters A should return empty array when no --filter arg", () => {
    const result = getFilters(["--output=some/folder/file.gen.ts"]);
    expect(result).toMatchInlineSnapshot(`[]`);
  });

  it("getFilters B should return single filter", () => {
    const result = getFilters(["--filter=FOO"]);
    expect(result).toMatchInlineSnapshot(`
      [
        "FOO",
      ]
    `);
  });

  it("getFilters C should return multiple filters from comma-separated value", () => {
    const result = getFilters(["--filter=FOO,BAR"]);
    expect(result).toMatchInlineSnapshot(`
      [
        "FOO",
        "BAR",
      ]
    `);
  });
});
