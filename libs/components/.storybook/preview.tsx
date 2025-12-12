import type { Decorator, Preview } from "@storybook/react-vite";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
// Import Tailwind CSS styles for Storybook
// oxlint-disable-next-line no-unassigned-import
import "../src/styles.css";
import "./tw.css";

const RouterDecorator: Decorator = Story => {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const routeTree = rootRoute;
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
};

const preview: Preview = {
  decorators: [RouterDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

// oxlint-disable-next-line no-default-export
export { preview as default };
