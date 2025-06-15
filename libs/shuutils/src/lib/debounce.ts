/**
 * Debounce any function
 * @param callback the function to debounce
 * @param waitFor the time to wait before calling the function
 * @returns promise with a resolve type of the original function’s return type
 */
export const debounce = <Method extends (...parameters: Parameters<Method>) => ReturnType<Method>>(callback: Method, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return async (...parameters: Parameters<Method>) =>
    new Promise<ReturnType<Method>>(resolve => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        resolve(callback(...parameters))
      }, waitFor)
    })
}
