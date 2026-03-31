// oxlint-disable unicorn/require-post-message-target-origin wrong rule in the worker because worker postMessage is different from window postMessage
// oxlint-disable max-nested-callbacks
import { useState, useRef, useCallback, useEffect } from "react";
import type { SchemaConfig, ValidationState, WorkerResponse } from "./xml-validator.type.ts";

// oxlint-disable-next-line max-lines-per-function
export function useXmlValidator(config: SchemaConfig) {
  const [state, setState] = useState<ValidationState>({ status: "idle" });
  const workerRef = useRef<Worker | undefined>(undefined);

  // Spin up and init the worker once when config is provided
  useEffect(() => {
    // oxlint-disable-next-line no-undef Worker is defined but not pick up. This is weird
    const worker = new Worker(new URL("xml-validator.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    setState({ status: "initializing" });

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      // oxlint-disable-next-line default-case
      switch (event.data.type) {
        case "ready": {
          setState({ status: "ready" });
          break;
        }
        case "result": {
          setState({
            errors: event.data.errors,
            schemaId: event.data.schemaId,
            status: "success",
            valid: event.data.valid,
          });
          break;
        }
        case "error": {
          setState({ message: event.data.message, status: "error" });
          break;
        }
      }
    });

    worker.addEventListener("error", (event: ErrorEvent) => {
      setState({ message: event.message, status: "error" });
    });

    worker.postMessage({ config, type: "init" });

    return () => {
      worker.terminate();
      workerRef.current = undefined;
    };
  }, [config]);

  const validate = useCallback((xml: string) => {
    if (!workerRef.current) {
      return;
    }
    setState({ status: "validating" });
    workerRef.current.postMessage({ type: "validate", xml });
  }, []);

  const isReady = state.status !== "idle" && state.status !== "initializing";

  return { isReady, state, validate };
}
