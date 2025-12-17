import type { ReactNode } from "react";

export function getNodeText(node: ReactNode): string {
  if (node === undefined) {
    return "";
  }

  switch (typeof node) {
    case "string":
    case "number": {
      return node.toString();
    }

    case "boolean": {
      return "";
    }

    case "object": {
      if (Array.isArray(node)) {
        return node.map(data => getNodeText(data)).join("");
      }
      if (node && "props" in node) {
        // @ts-expect-error type issue
        return getNodeText(node.props.children);
      }
      return "un-handled object";
    }

    default: {
      return "un-handled type";
    }
  }
}
