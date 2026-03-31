import addressXsd from "./fixture/complex/address.xsd?raw";
import commonTypesXsd from "./fixture/complex/common-types.xsd?raw";
import complexMainXsd from "./fixture/complex/main.xsd?raw";
import signatureXsd from "./fixture/complex/signature.xsd?raw";
import validComplexXml from "./fixture/complex/valid.xml?raw";
import invalidXml from "./fixture/simple/invalid.xml?raw";
import mainXsd from "./fixture/simple/main.xsd?raw";
import validXml from "./fixture/simple/valid.xml?raw";
import type { SchemaConfig, WorkerRequest, WorkerResponse } from "./xml-validator.type.ts";
import { createXmlValidatorWorker } from "./xml-validator.worker-runtime.ts";

function asWorkerMessageEvent(data: WorkerRequest): MessageEvent<WorkerRequest> {
  return { data } as MessageEvent<WorkerRequest>;
}

function simpleConfig(): SchemaConfig {
  return {
    dependenciesXsdById: {},
    mainXsdById: { simple: mainXsd },
    xmlRootNodeToMainXsdId: { note: "simple" },
  };
}

function complexFixtureConfig(): SchemaConfig {
  return {
    dependenciesXsdById: {
      "address.xsd": addressXsd,
      "common-types.xsd": commonTypesXsd,
      "https://www.w3.org/TR/xmldsig-core/xmldsig-core-schema.xsd": signatureXsd,
    },
    mainXsdById: { complex: complexMainXsd },
    xmlRootNodeToMainXsdId: { contact: "complex" },
  };
}

describe(createXmlValidatorWorker, () => {
  it("createXmlValidatorWorker queues onGlobalMessage before start then drains pending after start", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));
    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: validXml }));

    // we did not call start yet, so the messages are still in the queue
    expect(outbound).toHaveLength(0);

    await start();

    // after start, the messages are drained
    expect(outbound).toContainEqual({ type: "ready" });
    expect(outbound).toContainEqual(
      expect.objectContaining({
        errors: [],
        schemaId: "simple",
        type: "result",
        valid: true,
      }),
    );
  });

  it("createXmlValidatorWorker A posts ready after init", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));

    expect(outbound).toContainEqual({ type: "ready" });
  });

  it("createXmlValidatorWorker B validates conforming XML", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));

    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: validXml }));

    expect(outbound).toContainEqual(
      expect.objectContaining({
        errors: [],
        schemaId: "simple",
        type: "result",
        valid: true,
      }),
    );
  });

  it("createXmlValidatorWorker B2 accepts a second validate for the same schemaId (validator cache)", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));

    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: validXml }));
    onGlobalMessage(
      asWorkerMessageEvent({
        type: "validate",
        xml: "<note><to>9</to><from>8</from><body>7</body></note>",
      }),
    );

    const ok = outbound.filter((m): m is Extract<WorkerResponse, { type: "result" }> => m.type === "result" && m.valid);
    expect(ok).toHaveLength(2);
    expect(ok.every(message => message.schemaId === "simple")).toBe(true);
  });

  it("createXmlValidatorWorker C returns validation errors for invalid XML", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));

    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: invalidXml }));

    const result = outbound.find((m): m is Extract<WorkerResponse, { type: "result" }> => m.type === "result");
    expect(result).toBeDefined();
    if (result?.type === "result") {
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("createXmlValidatorWorker D posts error when root element has no schema mapping", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: simpleConfig(), type: "init" }));

    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: "<unknown-root/>" }));

    expect(outbound).toContainEqual(
      expect.objectContaining({
        message: "No schema found for root element: <unknown-root>",
        type: "error",
      }),
    );
  });

  it("createXmlValidatorWorker E posts error when schema id is missing from mainSchemas", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    const configWithBrokenMap: SchemaConfig = {
      dependenciesXsdById: {},
      mainXsdById: { simple: mainXsd },
      xmlRootNodeToMainXsdId: { note: "schemaKeyNotInMainSchemas" },
    };

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: configWithBrokenMap, type: "init" }));
    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: validXml }));

    expect(outbound).toContainEqual(
      expect.objectContaining({
        message: "Unknown schema: schemaKeyNotInMainSchemas",
        type: "error",
      }),
    );
  });

  it("createXmlValidatorWorker F registers dependency buffers so complex XSD includes resolve", async () => {
    const outbound: WorkerResponse[] = [];
    const { onGlobalMessage, start } = createXmlValidatorWorker(m => {
      outbound.push(m);
    });

    await start();

    onGlobalMessage(asWorkerMessageEvent({ config: complexFixtureConfig(), type: "init" }));
    onGlobalMessage(asWorkerMessageEvent({ type: "validate", xml: validComplexXml }));

    expect(outbound).toContainEqual(
      expect.objectContaining({
        errors: [],
        schemaId: "complex",
        type: "result",
        valid: true,
      }),
    );
  });
});
