import { sleep } from './functions.js'

/**
 * Default callback for onPageChange
 * @param location the new location
 */
function onPageChangeDefaultCallback(location: string) {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: it's ok here
  console.log(`location changed : ${location} but onPageChange callback is empty`)
}

/**
 * Detect location.href changes
 * @param callback the callback to call when location.href changes
 * @param wait the time to wait between each check, default 1000ms
 * @param last used for recursion, do not use it
 */
export async function onPageChange(callback = onPageChangeDefaultCallback, wait = 1000, last = '') {
  await sleep(wait)
  const current = document.location.href
  if (current !== last) callback(current)
  onPageChange(callback, wait, current)
}
