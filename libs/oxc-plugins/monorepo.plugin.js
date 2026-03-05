import { eslintCompatPlugin } from "@oxlint/plugins";

/**
 * @typedef {import("@oxlint/plugins").Rule} Rule
 * @typedef {import("@oxlint/plugins").Span} Node
 */

// source : https://github.com/eslint/eslint/blob/main/lib/rules/no-restricted-syntax.js
/** @type {Rule} */
const noRestrictedSyntaxRule = {
  create(context) {
    // oxlint-disable-next-line unicorn/no-array-reduce
    return /** @type {Array<string | { selector: string, message?: string }>} */ (context.options).reduce(
      (result, selectorOrObject) => {
        const isStringFormat = typeof selectorOrObject === "string";
        const hasCustomMessage = !isStringFormat && Boolean(selectorOrObject.message);
        const selector = isStringFormat ? selectorOrObject : selectorOrObject.selector;
        const message = hasCustomMessage ? selectorOrObject.message : `Using '${selector}' is not allowed.`;
        return Object.assign(result, {
          [selector](/** @type {Node} */ node) {
            context.report({
              data: { message },
              messageId: "restrictedSyntax",
              node,
            });
          },
        });
      },
      /** @type {Record<string, (node: Node) => void>} */ ({}),
    );
  },
  meta: {
    docs: {
      description: "Disallow specified syntax",
      recommended: false,
      url: "https://eslint.org/docs/latest/rules/no-restricted-syntax",
    },
    messages: {
      restrictedSyntax: "{{message}}",
    },
    schema: {
      items: {
        oneOf: [
          {
            type: "string",
          },
          {
            additionalProperties: false,
            properties: {
              message: { type: "string" },
              selector: { type: "string" },
            },
            required: ["selector"],
            type: "object",
          },
        ],
      },
      minItems: 0,
      type: "array",
      uniqueItems: true,
    },
    type: "suggestion",
  },
};

const plugin = eslintCompatPlugin({
  meta: {
    name: "monorepo-plugin",
  },
  rules: {
    "no-restricted-syntax": noRestrictedSyntaxRule,
  },
});

// oxlint-disable-next-line import/no-default-export
export default plugin;
