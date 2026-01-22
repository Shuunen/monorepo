/* c8 ignore start */
import { invariant } from "es-toolkit";

export function scrollToElement(querySelector: string) {
  const element = globalThis.document.querySelector("[data-testid='IDTravelDocuments-0']");
  invariant(element, `Cannot find element for query ${querySelector}`);
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}
