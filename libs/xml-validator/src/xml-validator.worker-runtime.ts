import type { WorkerRequest, WorkerResponse } from "./xml-validator.type.ts";

export type PostToHost = (message: WorkerResponse) => void;

/* v8 ignore start */
// oxlint-disable-next-line no-empty-function
const emptyFunction = () => {};
/* v8 ignore stop */

// oxlint-disable-next-line max-lines-per-function
export function createXmlValidatorWorker(postMessage: PostToHost) {
  const pendingMessages: MessageEvent<WorkerRequest>[] = [];
  let initialized = false;
  let handleMessage: (event: MessageEvent<WorkerRequest>) => void = emptyFunction;

  function onGlobalMessage(event: MessageEvent<WorkerRequest>) {
    if (!initialized) {
      pendingMessages.push(event);
      return;
    }
    handleMessage(event);
  }

  // oxlint-disable-next-line max-lines-per-function
  async function start(): Promise<void> {
    const { XmlDocument, XsdValidator, XmlValidateError, xmlRegisterInputProvider, XmlBufferInputProvider } =
      await import("libxml2-wasm");

    const encoder = new TextEncoder();
    const validatorCache = new Map<
      string,
      { validator: InstanceType<typeof XsdValidator>; schemaDoc: InstanceType<typeof XmlDocument> }
    >();
    let xmlRootNodeToXsdId: Record<string, string> = {};
    let mainXsdById: Record<string, string> = {};

    function getValidator(schemaId: string) {
      if (!validatorCache.has(schemaId)) {
        const xsdContent = mainXsdById[schemaId];
        if (!xsdContent) {
          throw new Error(`Unknown schema: ${schemaId}`);
        }
        const schemaDoc = XmlDocument.fromString(xsdContent);
        const validator = XsdValidator.fromDoc(schemaDoc);
        validatorCache.set(schemaId, { schemaDoc, validator });
      }
      return validatorCache.get(schemaId)?.validator;
    }

    function detectSchema(doc: InstanceType<typeof XmlDocument>): string {
      const schemaId = xmlRootNodeToXsdId[doc.root.name];
      if (!schemaId) {
        throw new Error(`No schema found for root element: <${doc.root.name}>`);
      }
      return schemaId;
    }

    function handleInitEvent(event: MessageEvent<WorkerRequest>) {
      if (event.data.type !== "init") {
        return;
      }
      const { config } = event.data;
      const { xmlRootNodeToMainXsdId: initialXmlRootNodeToXsdId, mainXsdById: initialMainXsdById } = config;
      xmlRootNodeToXsdId = initialXmlRootNodeToXsdId;
      mainXsdById = initialMainXsdById;

      const buffers: Record<string, Uint8Array> = {};
      for (const [key, content] of Object.entries(config.dependenciesXsdById)) {
        buffers[key] = encoder.encode(content);
      }

      xmlRegisterInputProvider(new XmlBufferInputProvider(buffers));

      postMessage({ type: "ready" });
    }

    function handleValidateEvent(event: MessageEvent<WorkerRequest>) {
      if (event.data.type !== "validate") {
        return;
      }
      const { xml } = event.data;
      let xmlDoc: InstanceType<typeof XmlDocument> | undefined = undefined;
      try {
        xmlDoc = XmlDocument.fromString(xml);
        const schemaId = detectSchema(xmlDoc);
        const validator = getValidator(schemaId);
        validator?.validate(xmlDoc);
        postMessage({ errors: [], schemaId, type: "result", valid: true });
      } catch (error) {
        if (error instanceof XmlValidateError) {
          postMessage({
            errors: error.details,
            type: "result",
            valid: false,
          });
          return;
        }
        postMessage({
          message: (error as Error).message,
          type: "error",
        });
      } finally {
        xmlDoc?.dispose();
      }
    }

    function dispatchWorkerMessage(event: MessageEvent<WorkerRequest>) {
      handleInitEvent(event);
      handleValidateEvent(event);
    }

    handleMessage = dispatchWorkerMessage;

    initialized = true;
    for (const event of pendingMessages) {
      handleMessage(event);
    }

    pendingMessages.length = 0;
  }

  return { onGlobalMessage, start };
}
