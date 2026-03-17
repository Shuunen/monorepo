/* v8 ignore start */
import { TooltipProvider } from "@monorepo/components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/app";
import { Footer } from "./app/footer";

const rootElement = document.querySelector("#root");
if (rootElement === null) throw new Error("Root element not found");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </BrowserRouter>
    <Footer />
  </StrictMode>,
);
