import type { ReactNode } from "react";

function hasChildrenProps(node: unknown): node is { props: { children?: ReactNode } } {
  if (typeof node !== "object" || node === null) {
    return false;
  }
  if (!("props" in node)) {
    return false;
  }
  const nodeWithProps = node as { props?: unknown };
  return typeof nodeWithProps.props === "object" && nodeWithProps.props !== null;
}

export function getNodeText(node: ReactNode): string {
  if (node === undefined) {
    return "";
  }

  // oxlint-disable-next-line typescript/switch-exhaustiveness-check
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
        return node.map((data: ReactNode) => getNodeText(data)).join("");
      }
      if (hasChildrenProps(node)) {
        return getNodeText(node.props.children);
      }
      return "unhandled object";
    }

    default: {
      return "unhandled type";
    }
  }
}
