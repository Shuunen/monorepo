import { consoleLog } from './browser-console.js'
import { sleep } from './sleep.js'

/**
 * Default callback for onPageChange
 * @param location the new location
 */
function onPageChangeDefaultCallback(location: string) {
  consoleLog(`location changed : ${location} but onPageChange callback is empty`)
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
  // biome-ignore lint/nursery/noFloatingPromises: we dont want to wait for the next call
  onPageChange(callback, wait, current)
}
