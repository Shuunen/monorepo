/// <reference lib="webworker" />

import { createXmlValidatorWorker } from "./xml-validator.worker-runtime.ts";

const { onGlobalMessage, start } = createXmlValidatorWorker(message => {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin
  globalThis.postMessage(message);
});

globalThis.addEventListener("message", onGlobalMessage);

void start();
