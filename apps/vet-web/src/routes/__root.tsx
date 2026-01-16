import { TestIdChecker, Toaster } from "@monorepo/components";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Header } from "../components/molecules/header";

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-full flex-col gap-4">
      <Header />
      <div className="mx-auto mt-4 mb-2 h-1 w-1/3 border-t border-stone-600" />
      <Outlet />
      {import.meta.env.DEV && <TestIdChecker />}
      <TanStackRouterDevtools />
      <Toaster name="default" />
    </div>
  ),
});
