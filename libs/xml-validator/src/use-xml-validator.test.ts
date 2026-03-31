import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ErrorDetail } from "libxml2-wasm";
import type { Mock } from "vitest";
import addressXsd from "./fixture/complex/address.xsd?raw";
import commonTypesXsd from "./fixture/complex/common-types.xsd?raw";
import complexMainXsd from "./fixture/complex/main.xsd?raw";
import signatureXsd from "./fixture/complex/signature.xsd?raw";
import validComplexXml from "./fixture/complex/valid.xml?raw";
import invalidSimpleXml from "./fixture/simple/invalid.xml?raw";
import simpleMainXsd from "./fixture/simple/main.xsd?raw";
import validSimpleXml from "./fixture/simple/valid.xml?raw";
import { useXmlValidator } from "./use-xml-validator.ts";
import type { SchemaConfig, WorkerResponse } from "./xml-validator.type.ts";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

const fixtureValidationConfig: SchemaConfig = {
  dependenciesXsdById: {
    "address.xsd": addressXsd,
    "common-types.xsd": commonTypesXsd,
    "https://www.w3.org/TR/xmldsig-core/xmldsig-core-schema.xsd": signatureXsd,
  },
  mainXsdById: { complex: complexMainXsd, simple: simpleMainXsd },
  xmlRootNodeToMainXsdId: { contact: "complex", note: "simple" },
};

const fixtureConfigNoteOnly: SchemaConfig = {
  ...fixtureValidationConfig,
  xmlRootNodeToMainXsdId: { note: "simple" },
};

const fixtureConfigContactOnly: SchemaConfig = {
  ...fixtureValidationConfig,
  xmlRootNodeToMainXsdId: { contact: "complex" },
};

type MockWorkerInstance = {
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  dispatchMessage: (data: WorkerResponse) => void;
  dispatchRuntimeError: (message: string) => void;
  errorListener: ((event: ErrorEvent) => void) | undefined;
  messageListener: ((event: MessageEvent<WorkerResponse>) => void) | undefined;
  postMessage: (data: unknown) => void;
  terminate: Mock<() => void>;
};

function defaultOnValidateMessage(worker: MockWorkerInstance, _xml: string) {
  worker.dispatchMessage({ errors: [], schemaId: "simple", type: "result", valid: true });
}

function replyWithWorkerError(worker: MockWorkerInstance) {
  worker.dispatchMessage({ message: "init failed", type: "error" });
}

function mockValidateSuccessComplex(worker: MockWorkerInstance) {
  worker.dispatchMessage({ errors: [], schemaId: "complex", type: "result", valid: true });
}

function failValidationWithDetail(worker: MockWorkerInstance, detail: ErrorDetail) {
  worker.dispatchMessage({ errors: [detail], type: "result", valid: false });
}

let onValidateMessage: (worker: MockWorkerInstance, xml: string) => void = defaultOnValidateMessage;

const createdWorkers: MockWorkerInstance[] = [];

function MockWorkerConstructor(this: MockWorkerInstance, _url?: URL, _options?: WorkerOptions) {
  const instance: MockWorkerInstance = {
    dispatchMessage(data: WorkerResponse) {
      instance.messageListener?.({ data } as MessageEvent<WorkerResponse>);
    },
    dispatchRuntimeError(message: string) {
      instance.errorListener?.({ message } as ErrorEvent);
    },
    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      const fn = typeof listener === "function" ? listener : listener.handleEvent.bind(listener);
      if (type === "message") {
        instance.messageListener = fn as (event: MessageEvent<WorkerResponse>) => void;
      }
      if (type === "error") {
        instance.errorListener = fn as (event: ErrorEvent) => void;
      }
    },
    errorListener: undefined,
    messageListener: undefined,
    postMessage(data: unknown) {
      if (typeof data !== "object" || data === null || !("type" in data)) {
        return;
      }
      const payload = data as { type: string; xml?: string };
      if (payload.type === "init") {
        globalThis.queueMicrotask(() => {
          instance.dispatchMessage({ type: "ready" });
        });
        return;
      }
      if (payload.type === "validate") {
        const xml = payload.xml ?? "";
        globalThis.queueMicrotask(() => {
          onValidateMessage(instance, xml);
        });
      }
    },
    terminate: vi.fn(),
  };
  createdWorkers.push(instance);
  Object.assign(this, instance);
}

beforeEach(() => {
  createdWorkers.length = 0;
  onValidateMessage = defaultOnValidateMessage;
  vi.stubGlobal("Worker", MockWorkerConstructor);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useXmlValidator, () => {
  it("useXmlValidator A reaches ready after worker init", async () => {
    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });
    expect(result.current.isReady).toBe(true);
  });

  it("useXmlValidator B sets success for simple fixture valid.xml", async () => {
    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    act(() => {
      result.current.validate(validSimpleXml.trim());
    });
    expect(result.current.state.status).toBe("validating");

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    expect(result.current.state).toMatchObject({
      errors: [],
      schemaId: "simple",
      status: "success",
      valid: true,
    });
  });

  it("useXmlValidator B2 sets success for complex fixture valid.xml", async () => {
    onValidateMessage = mockValidateSuccessComplex;

    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    act(() => {
      result.current.validate(validComplexXml.trim());
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    expect(result.current.state).toMatchObject({
      errors: [],
      schemaId: "complex",
      status: "success",
      valid: true,
    });
  });

  it("useXmlValidator C sets success with errors when validation fails (simple invalid.xml)", async () => {
    const detail: ErrorDetail = { col: 0, line: 2, message: "schema violation" };
    onValidateMessage = function onValidateInvalid(worker: MockWorkerInstance) {
      failValidationWithDetail(worker, detail);
    };

    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    act(() => {
      result.current.validate(invalidSimpleXml.trim());
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    expect(result.current.state).toMatchObject({
      errors: [detail],
      status: "success",
      valid: false,
    });
  });

  it("useXmlValidator D sets error state on worker error message", async () => {
    onValidateMessage = replyWithWorkerError;

    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    act(() => {
      result.current.validate(validSimpleXml.trim());
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    expect(result.current.state).toMatchObject({ message: "init failed", status: "error" });
  });

  it("useXmlValidator E sets error state on worker runtime error event", async () => {
    const { result } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    const [worker] = createdWorkers;
    expect(worker).toBeDefined();

    act(() => {
      worker?.dispatchRuntimeError("worker blew up");
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    expect(result.current.state).toMatchObject({ message: "worker blew up", status: "error" });
  });

  it("useXmlValidator F terminates worker on unmount", async () => {
    const { result, unmount } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    const [worker] = createdWorkers;
    expect(worker).toBeDefined();

    unmount();

    expect(worker?.terminate).toHaveBeenCalledOnce();
  });

  it("useXmlValidator G validate no-ops when worker ref is unset (e.g. after unmount)", async () => {
    const { result, unmount } = renderHook(() => useXmlValidator(fixtureValidationConfig));

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    const [worker] = createdWorkers;
    expect(worker).toBeDefined();
    // oxlint-disable-next-line typescript/no-non-null-assertion
    const postSpy = vi.spyOn(worker!, "postMessage");

    unmount();

    act(() => {
      result.current.validate(validSimpleXml.trim());
    });

    const validatePostCalls = postSpy.mock.calls.filter(
      call =>
        call[0] !== null &&
        typeof call[0] === "object" &&
        "type" in call[0] &&
        (call[0] as { type: string }).type === "validate",
    );

    expect(validatePostCalls).toHaveLength(0);
    expect(result.current.state.status).toBe("ready");
  });

  it("useXmlValidator H recreates worker when config changes", async () => {
    const { result, rerender } = renderHook(({ cfg }) => useXmlValidator(cfg), {
      initialProps: { cfg: fixtureConfigNoteOnly },
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    const [firstWorker] = createdWorkers;
    expect(firstWorker).toBeDefined();

    rerender({ cfg: fixtureConfigContactOnly });

    await waitFor(() => {
      expect(createdWorkers.length).toBe(2);
    });

    expect(firstWorker?.terminate).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });
  });
});
