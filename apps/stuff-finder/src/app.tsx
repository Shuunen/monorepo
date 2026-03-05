import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppLoader } from "./components/app-loader";
import { AppRoutes } from "./components/app-routes";

const AsyncAppSpeedDial = lazy(() =>
  // oxlint-disable-next-line promise/prefer-await-to-then
  import("./components/app-speed-dial").then(({ AppSpeedDial }) => ({ default: AppSpeedDial })),
);
// oxlint-disable-next-line promise/prefer-await-to-then
const AsyncPageSounds = lazy(() => import("./components/app-sounds").then(({ AppSounds }) => ({ default: AppSounds })));

export function App() {
  const fallback = useMemo(() => <AppLoader isLoading />, []);
  return (
    <Suspense fallback={fallback}>
      <BrowserRouter>
        <AppRoutes />
        <AsyncPageSounds />
        <AsyncAppSpeedDial />
      </BrowserRouter>
    </Suspense>
  );
}
