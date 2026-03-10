import { debounce, nbHueMax, on, storage, toastError } from "@monorepo/utils";
import { Route, Routes } from "react-router-dom";
import "./utils/database.utils";
import "./utils/idle.utils";
import { PageAbout } from "./pages/page-about";
import { PagePlanner } from "./pages/page-planner";
import { PageSettings } from "./pages/page-settings";
import { PageTasks } from "./pages/page-tasks";
import { checkUrlCredentials } from "./utils/credentials.utils";
import { logger } from "./utils/logger.utils";
import { state, watchState } from "./utils/state.utils";
import { loadTasks } from "./utils/tasks.utils";

const prefix = "what-now_";

function handleGlobalError(data: unknown) {
  if (data instanceof Error) return toastError(`global error catch : ${data.message}`);
  return toastError("global error catch : unknown error");
}

function setup() {
  if (storage.prefix === prefix) return;
  logger.info("app setup");
  storage.prefix = prefix;
  const previousWebhook = storage.get("hueEndpoint", ""); // remove me in few months
  if (state.webhook === "" && previousWebhook.length > 0) state.webhook = previousWebhook; // remove me in few months
  const loadTasksDebounced = debounce(loadTasks, nbHueMax);
  on("user-activity", () => loadTasksDebounced("user-activity"));
  watchState("showErrorToast", () => toastError(state.showErrorToast));
  on("error", handleGlobalError);
  watchState("isSetup", () => loadTasksDebounced("is-setup"));
  checkUrlCredentials(document.location.hash);
}

export function App() {
  setup();
  logger.info("app render");
  return (
    <Routes>
      <Route element={<PageTasks />} path="/" />
      <Route element={<PagePlanner />} path="/planner" />
      <Route element={<PageSettings />} path="/settings" />
      <Route element={<PageAbout />} path="/about" />
    </Routes>
  );
}
