import { Result } from './result.js'

/**
 * Inject styles in the DOM
 * @param string the string to inject, can be a url or a css string
 * @example injectStyles('https://example.com/styles.css')
 * @example injectStyles('body { background-color: red; }')
 * @returns a Result object
 */
export function injectStyles(string = '') {
  if (string.length === 0) return Result.error('injectStyles : cannot inject empty styles')

  if (string.includes('://') && !string.includes('\n') && string.includes('.css')) {
    document.querySelector('head')?.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${string}" />`)
    return Result.ok(`injectStyles : injected <link> with url "${string}"`)
  }

  document.body.insertAdjacentHTML('beforeend', `<style>${string}</style>`)
  return Result.ok('injectStyles : injected <style> with provided css')
}
