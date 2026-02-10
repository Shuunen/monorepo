import type { ReactNode } from "react";
import { functionReturningVoid } from "./functions.js";
import { getNodeText } from "./react.js";

describe("react", () => {
  it("getNodeText A string", () => {
    expect(getNodeText("Hello World")).toBe("Hello World");
  });

  it("getNodeText B number", () => {
    expect(getNodeText(42)).toBe("42");
  });

  it("getNodeText C boolean", () => {
    expect(getNodeText(true)).toBe("");
  });

  it("getNodeText D undefined", () => {
    expect(getNodeText(undefined)).toBe("");
  });

  it("getNodeText E array", () => {
    expect(getNodeText(["Hello", " ", "World", "!"])).toBe("Hello World!");
  });

  it("getNodeText F React element with string child", () => {
    const element = {
      props: {
        children: "Hello from React",
      },
    } as ReactNode;
    expect(getNodeText(element)).toBe("Hello from React");
  });

  it("getNodeText G React element with nested children", () => {
    const element = {
      props: {
        children: [
          "Hello ",
          {
            props: {
              children: "from ",
            },
          },
          {
            props: {
              children: "React",
            },
          },
        ],
      },
    } as ReactNode;
    expect(getNodeText(element)).toBe("Hello from React");
  });

  it("getNodeText H unhandled object", () => {
    const obj = { foo: "bar" } as unknown as ReactNode;
    expect(getNodeText(obj)).toBe("unhandled object");
  });

  it("getNodeText I unhandled type (function)", () => {
    expect(getNodeText(functionReturningVoid as unknown as ReactNode)).toBe("unhandled type");
  });
});
