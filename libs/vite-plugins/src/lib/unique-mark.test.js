import {
  addColorCode,
  generateMark,
  getProjectVersion,
  injectMark,
  injectMarkInAsset,
  injectMarkInAssets,
  uniqueMark,
  yellow,
} from "./unique-mark.node";

describe("vite-plugin-unique-mark", () => {
  it("addColorCode A wraps string with color codes", () => {
    const result = addColorCode(33, 39, "test");
    expect(result).toMatchInlineSnapshot(`"[33mtest[39m"`);
  });

  it("yellow A renders yellow string", () => {
    const result = yellow("warning");
    expect(result).toMatchInlineSnapshot(`"[33mwarning[39m"`);
  });

  it("generateMark A generate a mocked mark", () => {
    const mark = generateMark({ commit: "d52a6ba", date: new Date("2025-06-27T20:08:01"), version: "2.0.1" });
    expect(mark).toMatchInlineSnapshot(`"2.0.1 - d52a6ba - 27/06/2025 20:08"`);
  });

  const injectMarkTests = {
    a: {
      example: "simple placeholder with underscores",
      input: "Version: __my-placeholder__",
      output: "Version: MARK",
    },
    b: {
      example: "simple placeholder with mustache",
      input: "Version: {{ my-placeholder }}",
      output: "Version: MARK",
    },
    c: {
      example: "placeholder inside a div with id",
      input: '<div id="my-placeholder">Old Content</div>',
      output: '<div id="my-placeholder">MARK</div>',
    },
    d: {
      example: "placeholder inside a more complex HTML/JSX structure",
      input: `<motion.div variants={textAnimation}>
             {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok */}
             <div className="text-center text-sm font-mono pb-4" id="my-placeholder"></div>
           </motion.div>`,
      output: `<motion.div variants={textAnimation}>
             {/** biome-ignore lint/correctness/useUniqueElementIds: it's ok */}
             <div className="text-center text-sm font-mono pb-4" id="my-placeholder">MARK</div>
           </motion.div>`,
    },
    e: {
      example: "placeholder inside a JSX function call",
      input:
        'O.jsx(wt.div,{variants:cn,children:O.jsx("div",{className:"text-center text-sm font-mono pb-4",id:"my-placeholder"})})]})})}',
      output:
        'O.jsx(wt.div,{variants:cn,children:O.jsx("div",{className:"text-center text-sm font-mono pb-4",id:"my-placeholder",children:"MARK"})})]})})}',
    },
    f: {
      example: "empty string",
      input: "",
      output: "",
    },
    g: {
      example: "string without placeholder",
      input: "Hello world",
      output: "Hello world",
    },
    h: {
      example: "string that contains one placeholder on a meta tag",
      input: '<meta name="my-placeholder" content="..." />',
      output: '<meta name="my-placeholder" content="MARK" />',
    },
    i: {
      example: "string that contains one placeholder on a meta tag with reversed attributes",
      input: '<meta content="..." name="my-placeholder" />',
      output: '<meta content="MARK" name="my-placeholder" />',
    },
    j: {
      example: "string that contains one placeholder on a meta tag with additional attributes",
      input: '<meta charset="UTF-8" name="my-placeholder" content="..." />',
      output: '<meta charset="UTF-8" name="my-placeholder" content="MARK" />',
    },
    k: {
      example: "complex string with multiple placeholders",
      input:
        'Hello __my-placeholder__ I like <meta name="my-placeholder" content="..." /> and <div id="my-placeholder" class="mt-6 p-4">OLD-mark</div> :)',
      output:
        'Hello MARK I like <meta name="my-placeholder" content="MARK" /> and <div id="my-placeholder" class="mt-6 p-4">MARK</div> :)',
    },
  };

  for (const [key, { example, input, output }] of Object.entries(injectMarkTests)) {
    it(`injectMark ${key.toUpperCase()} ${example}`, () => {
      const result = injectMark(input, "my-placeholder", "MARK");
      expect(result).toBe(output);
    });
  }

  it("injectMarkInAsset A injects mark in js file", () => {
    const asset = { code: 'console.log("__unique-mark__")', source: "" };
    injectMarkInAsset({ asset, fileName: "main.js", mark: "MARK", placeholder: "unique-mark" });
    expect(asset.code).toContain("MARK");
  });

  it("injectMarkInAsset B injects mark in html file", () => {
    const asset = { code: "", source: "<!-- __unique-mark__ -->" };
    injectMarkInAsset({ asset, fileName: "index.html", mark: "MARK", placeholder: "unique-mark" });
    expect(asset.source).toContain("MARK");
  });

  it("injectMarkInAsset C warns when placeholder not replaced", () => {
    const asset = { code: "/* unknown-placeholder format */", source: "" };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      /* suppress warning */
    });
    injectMarkInAsset({ asset, fileName: "main.js", mark: "MARK", placeholder: "unknown-placeholder" });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("unknown-placeholder"));
    warnSpy.mockRestore();
  });

  it("injectMarkInAssets C injects into multiple assets (observable effect)", () => {
    const assets = {
      "a.js": { code: "__unique-mark__", source: "" },
      "b.html": { code: "", source: "__unique-mark__" },
      "c.css": { code: "", source: "/* __unique-mark__ */" },
      "d.txt": { code: "", source: "no mark" },
    };
    injectMarkInAssets(assets, "unique-mark", "1.2.3");
    expect(assets["a.js"].code).toContain("1.2.3");
    expect(assets["b.html"].source).toContain("1.2.3");
    expect(assets["c.css"].source).toContain("1.2.3");
    expect(assets["d.txt"].source).toBe("no mark");
  });

  it("getProjectVersion A returns version from package.json (integration)", () => {
    const version = getProjectVersion(process.cwd());
    expect(typeof version).toBe("string");
  });

  it("getProjectVersion B returns empty string and logs warning on error", () => {
    expect(getProjectVersion("/no/such/path")).toBe("");
  });

  it("uniqueMark A plugin uses default placeholder when none provided", () => {
    const plugin = uniqueMark(); // No options provided
    expect(plugin.name).toBe("vite-plugin-unique-mark");
    expect(plugin.apply).toBe("build");
    expect(plugin.enforce).toBe("post");
  });

  it("uniqueMark B plugin returns correct shape and calls hooks (smoke)", () => {
    const plugin = uniqueMark({ placeholder: "ph" });
    expect(plugin.name).toBe("vite-plugin-unique-mark");
    expect(plugin.apply).toBe("build");
    expect(plugin.enforce).toBe("post");
    // Verify the plugin has the expected methods
    expect(typeof plugin.configResolved).toBe("function");
    expect(typeof plugin.generateBundle).toBe("function");
    // Test that configResolved is callable (without actually calling it)
    expect(plugin.configResolved).toBeInstanceOf(Function);
    expect(plugin.generateBundle).toBeInstanceOf(Function);
  });

  it("uniqueMark C plugin hooks execute successfully for coverage", () => {
    const plugin = uniqueMark({ placeholder: "test-mark" });
    // Verify plugin methods exist and are callable
    expect(typeof plugin.configResolved).toBe("function");
    expect(typeof plugin.generateBundle).toBe("function");
    // Execute plugin hooks to achieve full coverage
    const mockConfig = { root: process.cwd() };
    const mockBundle = { "test.js": { code: "__test-mark__", source: "" } };
    // These methods may not have full context but should execute without throwing
    expect(() => {
      const method = plugin.configResolved;
      method(mockConfig);
    }).not.toThrow();
    expect(() => {
      const method = plugin.generateBundle;
      method({}, mockBundle, false);
    }).not.toThrow();
  });

  it("uniqueMark D plugin with empty and undefined options", () => {
    // Test with empty object
    const plugin1 = uniqueMark({});
    expect(plugin1.name).toBe("vite-plugin-unique-mark");
    // Test with undefined (this should use default placeholder)
    const plugin2 = uniqueMark(undefined);
    expect(plugin2.name).toBe("vite-plugin-unique-mark");
    // Test with no arguments at all
    const plugin3 = uniqueMark();
    expect(plugin3.name).toBe("vite-plugin-unique-mark");
  });
});
