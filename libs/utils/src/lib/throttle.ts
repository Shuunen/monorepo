/**
 * Returns a throttled function that will be called at most once every `timeout` milliseconds.
 * @copyright inspired from https://www.matthewgerstman.com/tech/throttle-and-debounce
 * @param callback the function to throttle
 * @param timeout the time to wait before each function call
 * @returns a throttled function
 */
export function throttle<Arguments extends readonly unknown[], Return>(
  callback: (...arguments_: Arguments) => Return,
  timeout: number,
): (...arguments_: Arguments) => void {
  let isReady = true;
  return (...arguments_: Arguments) => {
    if (!isReady) {
      return;
    }
    isReady = false;
    callback(...arguments_);
    setTimeout(() => {
      isReady = true;
    }, timeout);
  };
}
