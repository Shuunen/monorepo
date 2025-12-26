import { describe, expect, it } from "vitest";
import { injectMark } from "./string-inject-mark.js";

describe("string-inject-mark", () => {
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
      input: 'O.jsx(wt.div,{variants:cn,children:O.jsx("div",{className:"text-center text-sm font-mono pb-4",id:"my-placeholder"})})]})})}',
      output: 'O.jsx(wt.div,{variants:cn,children:O.jsx("div",{className:"text-center text-sm font-mono pb-4",id:"my-placeholder",children:"MARK"})})]})})}',
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
      input: 'Hello __my-placeholder__ I like <meta name="my-placeholder" content="..." /> and <div id="my-placeholder" class="mt-6 p-4">OLD-mark</div> :)',
      output: 'Hello MARK I like <meta name="my-placeholder" content="MARK" /> and <div id="my-placeholder" class="mt-6 p-4">MARK</div> :)',
    },
  };

  for (const [key, { example, input, output }] of Object.entries(injectMarkTests)) {
    it(`injectMark ${key.toUpperCase()} ${example}`, () => {
      const result = injectMark(input, "my-placeholder", "MARK");
      expect(result).toBe(output);
    });
  }
});
