// oxlint-disable only-export-components, no-multi-comp
import { TooltipProvider } from "@monorepo/components";
import type { Decorator, Preview } from "@storybook/react-vite";
// Import Tailwind CSS styles for Storybook
import "../src/styles.css";
import "./tw.css";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";

const RouterDecorator: Decorator = Story => {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const routeTree = rootRoute;
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
};

const TooltipDecorator: Decorator = Story => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
);

const preview: Preview = {
  decorators: [RouterDecorator, TooltipDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

// oxlint-disable-next-line import/no-default-export
export { preview as default };
