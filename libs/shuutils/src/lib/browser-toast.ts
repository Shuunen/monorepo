/**
 * Hides the toast element by applying a transform and removing it after a delay.
 * @param element - The toast element to hide.
 * @param delay - The delay in milliseconds before removing the element.
 */
function toastHide(element: HTMLElement, delay = 200) {
  element.style.opacity = '0'
  element.style.transform = 'translateX(300px)'
  setTimeout(() => {
    /* c8 ignore next */
    element.remove()
  }, delay)
}

/**
 * Shows a toast element with a specified delay.
 * @param element - The toast element to be shown.
 * @param delay - The delay in milliseconds before showing the toast.
 */
function toastShow(element: HTMLElement, delay = 100) {
  document.body.append(element)
  setTimeout(() => {
    /* c8 ignore next 2 */
    element.style.opacity = '1'
    element.style.transform = 'translateX(0)'
  }, delay)
}

/**
 * Returns the style for the toast notification based on the type.
 * @param type the type of the toast notification
 * @returns the style for the toast notification
 */
function toastStyle(type: 'error' | 'info' | 'success') {
  if (type === 'success') return { backgrounds: ['MediumSeaGreen', 'SeaGreen'], icon: '&check;', iconStyle: 'line-height: 21px; text-indent: 1px;' }
  if (type === 'error') return { backgrounds: ['FireBrick', 'Brown'], icon: 'x', iconStyle: 'line-height: 21.5px;' }
  return { backgrounds: ['DodgerBlue', 'RoyalBlue'], icon: 'i', iconStyle: 'line-height: 21px;' }
}

/**
 * Adds a toast notification to the document body.
 * @param type - The type of the toast notification.
 * @param message - The message to be displayed in the toast notification.
 * @param delay - The delay in milliseconds before the toast notification is removed.
 * @param padding - The padding in pixels for the toast notification.
 */
// oxlint-disable-next-line max-params
function toastAdd(type: 'error' | 'info' | 'success', message = '', delay = 0, padding = 14) {
  const element = document.createElement('div')
  element.setAttribute('class', 'shu-toast')
  const last = document.querySelector('.shu-toast:nth-last-child(1 of .shu-toast)')?.getBoundingClientRect().top
  const bottom = last === undefined ? 0 : globalThis.innerHeight - last
  const { backgrounds, icon, iconStyle } = toastStyle(type)
  element.style = `position: fixed; display: flex; align-items: center; gap: 9px; bottom: ${bottom + padding}px; right: ${padding}px; z-index: 99999; padding: 12px 20px 11px 14px; background: linear-gradient(45deg, ${backgrounds[0]}, 20%, ${backgrounds[1]}); color: white; border-radius: 5px; box-shadow: 0 3px 7px 0 rgba(0,0,0,.5); font-size: 18px; opacity: 0; transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out; transform: translateX(300px);`
  element.innerHTML = `<span style="${iconStyle}border-radius: 50%; color: ${backgrounds[1]}; background-color: #ffffff90; width: 20px; height: 20px; text-align: center; font-weight: bolder; font-size: 12px;">${icon}</span><span style="margin-top: -1px;">${message}</span>`
  // biome-ignore lint/suspicious/noConsole: it's ok here
  console[type === 'error' ? 'error' : 'log'](`toast ${type} : ${message}`)
  toastShow(element)
  if (delay > 0)
    setTimeout(() => {
      toastHide(element)
    }, delay)
}

/**
 * Displays an error toast message.
 * @param message - The error message to display.
 * @param delay - The delay in milliseconds before the toast disappears. Default is 4000ms.
 * @example utils.toastError('hello world')
 */
export function toastError(message: string, delay = 4000) {
  toastAdd('error', message, delay)
}

/**
 * Displays an info toast message.
 * @param message - The info message to display.
 * @param delay - The delay in milliseconds before the toast disappears. Default is 3000ms.
 * @example utils.toastInfo('hello world')
 */
export function toastInfo(message: string, delay = 2000) {
  toastAdd('info', message, delay)
}

/**
 * Displays a success toast message.
 * @param message - The success message to display.
 * @param delay - The delay in milliseconds before the toast disappears. Default is 2000ms.
 * @example utils.toastSuccess('hello world')
 */
export function toastSuccess(message: string, delay = 2000) {
  toastAdd('success', message, delay)
}
