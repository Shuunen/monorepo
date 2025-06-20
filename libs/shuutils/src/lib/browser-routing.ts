import { isBrowserEnvironment } from './environment.js'

/**
 * Remove extra slashes from URL
 * @param url - URL to clean
 * @returns Cleaned URL
 */
function removeExtraSlashes(url: string) {
  return url.replace(/\/{2,}/gu, '/')
}

/**
 * Get the path from a URL
 * @param url - URL to get path from
 * @param addLang - Add language to path
 * @returns Path
 */
export function getPath(url = '', addLang = '') {
  let path = url === '' && isBrowserEnvironment() ? document.location.pathname : url
  if (path === 'blank') path = ''
  path = removeExtraSlashes(path)
  // biome-ignore lint/performance/useTopLevelRegex: fix me later
  path = path.replace(/^\/[a-z]{2}\//u, '/') // remove any lang from path
  if (addLang !== '') path = `/${addLang}/${path}` // add target lang to path
  return removeExtraSlashes(path)
}

/**
 * Get the page from a URL
 * @param url - URL to get page from
 * @returns Page
 */
export function getPage(url = '') {
  const path = getPath(url).slice(1)
  if (path === '') return 'index'
  /* c8 ignore next */
  return path.split('.')[0] ?? ''
}
