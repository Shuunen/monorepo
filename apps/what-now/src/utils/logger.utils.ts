/* v8 ignore file -- @preserve */
import { isBrowserEnvironment, Logger } from "@monorepo/utils";

export const logger = new Logger({ minimumLevel: "3-info", willOutputToConsole: isBrowserEnvironment() });
