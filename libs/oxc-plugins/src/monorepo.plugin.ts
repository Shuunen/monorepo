import { defineRule, eslintCompatPlugin, type Node } from "@oxlint/plugins";

// source : https://github.com/eslint/eslint/blob/main/lib/rules/no-restricted-syntax.js
const noRestrictedSyntaxRule = defineRule({
  create(context) {
    // oxlint-disable-next-line unicorn/no-array-reduce
    return context.options.reduce<Record<string, (node: Node) => void>>((result, selectorOrObject) => {
      const isStringFormat = typeof selectorOrObject === "string";
      // @ts-expect-error not our source code
      const hasCustomMessage = !isStringFormat && Boolean(selectorOrObject.message);
      // @ts-expect-error not our source code
      const selector = isStringFormat ? selectorOrObject : selectorOrObject.selector;
      // @ts-expect-error not our source code
      const message = hasCustomMessage ? selectorOrObject.message : `Using '${selector}' is not allowed.`;
      return Object.assign(result, {
        [selector](node: Node) {
          context.report({
            data: { message },
            messageId: "restrictedSyntax",
            node,
          });
        },
      });
    }, {});
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
});

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
