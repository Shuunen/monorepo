/* c8 ignore start */
// oxlint-disable no-console

/**
 * Log a message to the native console when it's needed to use the native (boring) console
 * @param messages the messages to log to the console
 */
export function consoleLog(...messages: unknown[]) {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(...messages)
}
