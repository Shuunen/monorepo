import { nbSpacesIndent } from './constants.js'

/**
 * Clean dynamic data from a string
 * @param text the string to clean
 * @returns the cleaned string
 */
function clean(text: string) {
  return (
    text
      // 16/05/2024 17:36:32 => xx/xx/xxxx xx:xx:xx
      .replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/gu, 'xx/xx/xxxx xx:xx:xx')
      // 6/25/2024, 11:21:23 AM => xx/xx/xxxx xx:xx:xx
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [ap]m/giu, 'xx/xx/xxxx xx:xx:xx')
      // 2024-05-16T15:36:32.000Z => xxxx-xx-xxTxx:xx:xx.xxxZ
      .replace(/\d{4}-\d{2}-\d{2}([T ])\d{2}:\d{2}:\d{2}(\.\d{3}Z)?/gu, (_match, p1, p2) => `xxxx-xx-xx${p1}xx:xx:xx${p2 ? '.xxxZ' : ''}`)
      // \\documents\\file.pdf => /documents/file.pdf
      .replace(/\\+(?<letter>[^"])/gu, '/$<letter>')
  )
}

/**
 * Align & clean dynamic data & operating system related stuff that can mess-up the snaps
 * @param content the string to clean
 * @returns the content aligned for snapshots
 * @example alignForSnap('Lu et approuvé le 16/05/2024 17:36:32') // => 'Lu et approuvé le xx/xx/xxxx xx:xx:xx'
 * @example alignForSnap({ value: '\\documents\\my-file.pdf' }) // => '{ "value": "/documents/my-file.pdf" }'
 */
export function alignForSnap(content: unknown): string {
  if (typeof content === 'string') return clean(content)
  if (content === null || content === undefined) return String(content)
  if (content instanceof HTMLElement) return clean(content.textContent)
  if (Array.isArray(content) || content instanceof NodeList || content instanceof HTMLCollection)
    return Array.from(content)
      .map(item => alignForSnap(item))
      .join(' | ')
  return clean(JSON.stringify(content, undefined, nbSpacesIndent))
}
