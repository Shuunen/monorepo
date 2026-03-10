import { createContext, useContext } from "react";
import type { AutoFormData } from "./auto-form.types";

const AutoFormParentDataContext = createContext<AutoFormData | undefined>(undefined);

export const AutoFormParentDataProvider = AutoFormParentDataContext.Provider;

// oxlint-disable-next-line only-export-components
export function useAutoFormParentData() {
  return useContext(AutoFormParentDataContext);
}
