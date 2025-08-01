// ==UserScript==
// @name         Text Guard
// @author       Romain Racamier-Lafon
// @description  Check the text of the current page, show alerts if it contains weird/forbidden words
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/text-guard.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/text-guard.user.js
// @namespace    https://github.com/Shuunen
// @icon         https://www.google.com/s2/favicons?sz=64&domain=saveur-biere.com
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @require      https://unpkg.com/rough-notation/lib/rough-notation.iife.js
// @version      1.0.4
// ==/UserScript==

// This script use two ways to find elements in the document:
// 1. Using XPath expressions with document.evaluate
// 2. Using querySelectorAll
// both methods are used to find elements containing a specific word in their text content, sometimes one method is more efficient than the other ¯\_(ツ)_/¯

function TextGuard() {
  const counts = {
    forbidden: 0,
  }
  const forbiddenWords = ['23 rue du Berry']
  const hostExceptions = new Set(['localhost'])
  const elementExceptions = new Set(['br', 'circle', 'defs', 'ellipse', 'g', 'hr', 'iframe', 'line', 'link', 'meta', 'path', 'polygon', 'polyline', 'rect', 'script', 'style', 'svg', 'symbol', 'text', 'title', 'use'])
  const utils = new Shuutils('txt-grd')
  /**
   * Handles the detection of a forbidden word.
   * @param {string} word the forbidden word that was detected.
   * @param {HTMLElement} element the element containing the forbidden word.
   * @returns {void}
   */
  function onForbidden(word, element) {
    if (element.dataset.txtGrd === 'forbidden') return
    element.dataset.txtGrd = 'forbidden'
    counts.forbidden += 1
    // oxlint-disable no-undef
    // biome-ignore lint/correctness/noUndeclaredVariables: RoughNotation exists in global
    const annotation1 = RoughNotation.annotate(element, { color: 'red', strokeWidth: 4, type: 'box' })
    // biome-ignore lint/correctness/noUndeclaredVariables: RoughNotation exists in global
    const annotation2 = RoughNotation.annotate(element, { color: 'yellow', type: 'highlight' })
    // biome-ignore lint/correctness/noUndeclaredVariables: RoughNotation exists in global
    const annotationGroup = RoughNotation.annotationGroup([annotation1, annotation2])
    annotationGroup.show()
    utils.error(`Forbidden word detected: ${word}`)
  }
  /**
   * Sanitizes the given text by removing accents, case and other fancy stuff.
   * @param {string} text - The text to be sanitized.
   * @returns {string} The sanitized text.
   */
  function sanitize(text) {
    return utils.readableString(utils.removeAccents(text.toLocaleLowerCase()))
  }
  /**
   * Finds elements in the document that contain a specific word
   * @param {string} word - The word to search for in the elements' text content.
   * @returns {HTMLElement[]} An array of HTMLElements that match the XPath expression and contain the specified word.
   */
  function findElementsByXpath(word) {
    const needle = sanitize(word)
    const results = document.evaluate(`//*[contains(translate(text(),"ABCDEFGHIJKLMNOPQRSTUVWXYZ ,","abcdefghijklmnopqrstuvwxyz "),"${needle}")]`, document, undefined, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)
    const elements = []
    for (let index = 0; index < results.snapshotLength; index += 1) {
      const node = results.snapshotItem(index)
      if (node === null) continue
      if (!(node instanceof HTMLElement)) {
        utils.error(`Node is not an HTMLElement: ${node?.nodeName || 'unknown'}`, node)
        utils.showError('Node is not an HTMLElement')
        continue
      }
      if (node.dataset.txtGrd !== undefined) continue
      node.dataset.txtGrd = 'found'
      elements.push(node)
    }
    return elements
  }
  /**
   * Finds all elements in the document that contain the specified word.
   * @param {string} word - The word to search for.
   * @returns {Array<HTMLElement>} - An array of elements that contain the specified word.
   */
  // oxlint-disable max-lines-per-function
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: FIX me later
  function findElementsByQueryAll(word) {
    const needle = sanitize(word)
    const elements = Array.from(document.querySelectorAll('*'))
    /**
     * @type {HTMLElement[]}
     */
    const results = []

    for (const element of elements) {
      if (elementExceptions.has(element.tagName.toLowerCase())) continue
      if (!(element instanceof HTMLElement)) {
        utils.error('Element is not an HTMLElement, tag is : ', element.tagName)
        continue
      }
      if (element.dataset.txtGrd !== undefined) continue
      const children = Array.from(element.children).filter(child => !['b', 'br'].includes(child.tagName.toLowerCase()))
      if (children.length > 0) continue
      const text = sanitize(element.textContent ?? '')
      if (!text.includes(needle)) continue
      element.dataset.txtGrd = 'found'
      results.push(element)
    }
    return results
  }
  /**
   * Searches for a specified word in the document and performs an action based on the isForbidden parameter.
   * @param {string} word - The word to search for.
   * @param {boolean} isForbidden - Indicates whether the word is forbidden.
   */
  function search(word, isForbidden) {
    const elements = [...findElementsByQueryAll(word), ...findElementsByXpath(word)]
    if (elements.length > 0) utils.log(`found ${elements.length} element(s) :`, elements)
    for (const element of elements)
      if (isForbidden) onForbidden(word, element)
      else utils.showLog(`Found warn word: ${word}`)
  }
  /**
   * Reports the number of forbidden words found.
   */
  function report() {
    if (counts.forbidden > 0) utils.showError(`Found ${counts.forbidden} forbidden words`)
    else utils.log('no forbidden words found')
  }
  /**
   * Initializes the script.
   */
  function init() {
    if (hostExceptions.has(globalThis.location.hostname)) return
    utils.debug('start...')
    counts.forbidden = 0
    const text = document.body.textContent ?? ''
    if (text === '') {
      utils.showError('No text found in the current page')
      return
    }
    for (const word of forbiddenWords) search(word, true)
    report()
  }
  const initDebouncedTime = 500
  const initDebounced = utils.debounce(init, initDebouncedTime)
  initDebounced()
  /**
   * Handles page mutations
   * @param {MutationRecord[]} mutations the mutations that occurred
   */
  function onMutation(mutations) {
    // const { target } = event
    const element = mutations[0]?.addedNodes[0]
    if (element === null || element === undefined) return
    if (!(element instanceof HTMLElement)) return
    if (elementExceptions.has(element.tagName.toLowerCase())) return
    if (element.className.includes('shu-toast')) return
    utils.debug('mutation detected', mutations[0])
    initDebounced()
  }
  const observer = new MutationObserver(onMutation)
  observer.observe(document.body, { childList: true, subtree: true })
}

if (globalThis.window) TextGuard()
else module.exports = {}
