import type { FloatingMenuAction } from "@monorepo/components";
// oxlint-disable-next-line no-restricted-imports
import { CalendarIcon, CircleQuestionMarkIcon, HomeIcon, SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Returns a filtered list of navigation actions, excluding any whose name includes the given string.
 * Each action contains a `handleClick` function for navigation, an `icon` component, and a `name`.
 * @returns An array of action objects excluding those whose names include the `except` string.
 */
export function useActions() {
  const navigate = useNavigate();
  const currentPath = globalThis.location.pathname;
  // oxlint-disable-next-line require-param
  function getAction(icon: FloatingMenuAction["icon"], name: FloatingMenuAction["name"], path: string) {
    return {
      disabled: path === currentPath,
      handleClick: () => navigate(path),
      icon,
      name,
    } satisfies FloatingMenuAction;
  }
  return [getAction(HomeIcon, "Tasks", "/"), getAction(CalendarIcon, "Planner", "/planner"), getAction(SettingsIcon, "Settings", "/settings"), getAction(CircleQuestionMarkIcon, "About", "/about")];
}
