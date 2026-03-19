import { createContext, useContext } from "react";

const AutoFormSubmittedContext = createContext(false);

export const AutoFormSubmittedProvider = AutoFormSubmittedContext.Provider;

// oxlint-disable-next-line only-export-components
export function useAutoFormSubmitted() {
  return useContext(AutoFormSubmittedContext);
}
