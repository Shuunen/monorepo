/* v8 ignore start */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { XmlValidation } from "./components/xml-validation";

const rootElement = document.querySelector("#root");
if (rootElement === null) throw new Error("Root element not found");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <XmlValidation />
    </BrowserRouter>
  </StrictMode>,
);
