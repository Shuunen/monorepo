/* v8 ignore start */
// oxlint-disable no-console

/**
 * Log a message to the native console when it's needed to use the native (boring) console
 * @param messages the messages to log to the console
 */
export function consoleLog(...messages: unknown[]) {
  console.log(...messages);
}
