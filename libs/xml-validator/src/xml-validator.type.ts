import type { ErrorDetail } from "libxml2-wasm";

export type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; valid: boolean; errors: ErrorDetail[]; schemaId?: string }
  | { type: "error"; message: string };

export type SchemaConfig = {
  xmlRootNodeToMainXsdId: Record<string, string>;
  mainXsdById: Record<string, string>;
  dependenciesXsdById: Record<string, string>;
};

export type WorkerRequest = { type: "init"; config: SchemaConfig } | { type: "validate"; xml: string };

export type ValidationState =
  | { status: "idle" }
  | { status: "initializing" }
  | { status: "ready" }
  | { status: "validating" }
  | { status: "success"; valid: boolean; errors: ErrorDetail[]; schemaId?: string }
  | { status: "error"; message: string };
