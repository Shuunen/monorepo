/**
 * Returns a throttled function that will be called at most once every `timeout` milliseconds.
 * @copyright inspired from https://www.matthewgerstman.com/tech/throttle-and-debounce
 * @param callback the function to throttle
 * @param timeout the time to wait before each function call
 * @returns a throttled function
 */
export function throttle<Method extends (...parameters: readonly unknown[]) => ReturnType<Method>>(callback: Method, timeout: number) {
  let isReady = true
  return (...parameters: Parameters<Method>) => {
    if (!isReady) return
    isReady = false
    callback(...parameters)
    setTimeout(() => {
      isReady = true
    }, timeout)
  }
}
