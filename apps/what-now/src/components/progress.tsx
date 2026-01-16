import { debounce, fetchRaw, nbHueMax, nbPercentMax } from "@monorepo/utils";
import type { Task } from "../types";
import { logger } from "../utils/logger.utils";
import { webhookPayload } from "../utils/progress.utils";
import { state } from "../utils/state.utils";
import { isTaskActive } from "../utils/tasks.utils";

function counterText(percent = 0) {
  /* oxlint-disable no-magic-numbers */
  if (!percent) return "Nothing done... yet";
  if (percent <= 25) return "Amuse-bouche : check";
  if (percent <= 33) return "Now we are talking";
  if (percent <= 50) return "Halfway to heaven";
  if (percent <= 75) return "Final chapter for today";
  if (percent < 100) return "Lasts tasks remaining !";
  return "You made it, well done dude :)";
  /* oxlint-enable no-magic-numbers */
}

async function emitToWebhook(progress: number) {
  const options = {
    body: webhookPayload(progress),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
    mode: "no-cors",
  } as const;
  const result = await fetchRaw(state.webhook, options);
  logger.info("webhook response", result);
}

function getProgressBackground(percent: number) {
  /* oxlint-disable no-magic-numbers */
  if (percent <= 10) return "from-red-700 to-red-800";
  if (percent <= 20) return "from-red-800 to-orange-700";
  if (percent <= 30) return "from-orange-700 to-yellow-700";
  if (percent <= 40) return "from-yellow-700 to-yellow-800";
  if (percent <= 50) return "from-yellow-800 to-yellow-900";
  if (percent <= 60) return "from-yellow-900 to-green-700";
  if (percent <= 70) return "from-green-700 to-green-800";
  if (percent <= 80) return "from-green-800 to-green-900";
  if (percent <= 90) return "from-green-900 to-green-950";
  return "from-green-950 to-green-950";
  /* oxlint-enable no-magic-numbers */
}

function showProgressBackground(percent: number) {
  logger.info(`show progress background for ${percent}%`);
  const target = getProgressBackground(percent);
  document.body.className = document.body.className.replaceAll(/from-\w+-\d+ to-\w+-\d+/giu, target);
}

function showProgressSync(percent: number) {
  if (document.body.dataset.progress === String(percent)) return;
  logger.info("show progress", { percent });
  document.body.dataset.progress = String(percent);
  state.statusProgress = counterText(percent);
  showProgressBackground(percent);
  if (state.webhook !== "") void emitToWebhook(percent);
}

const showProgress = debounce(showProgressSync, nbHueMax);

export function Progress({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  if (total === 0) return;
  const remaining = tasks.filter(task => isTaskActive(task)).length;
  const percent = nbPercentMax - Math.round((remaining / total) * nbPercentMax);
  void showProgress(percent);
  return <div className="border border-dashed border-white" data-testid="progress" style={{ width: `${percent}%` }} />;
}
