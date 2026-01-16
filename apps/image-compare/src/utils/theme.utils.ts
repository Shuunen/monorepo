import { logger } from "./logger.utils";

export function setDarkTheme(isDark: boolean) {
  logger.info(`${isDark ? "Enabling" : "Disabling"} dark theme`);
  document.documentElement.classList.toggle("dark", isDark);
}
