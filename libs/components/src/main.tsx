/* v8 ignore start */
import { createRoot } from "react-dom/client";
import { KitchenSink } from "./molecules/kitchen-sink";

// oxlint-disable-next-line typescript/non-nullable-type-assertion-style
export const root = createRoot(document.querySelector("#root") as HTMLElement);

root.render(<KitchenSink />);
