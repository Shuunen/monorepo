// ==UserScript==
// @name         Dealabs - All in one
// @author       Romain Racamier-Lafon
// @description  Un-clutter & add filters to Dealabs
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/dealabs-aio.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/dealabs-aio.user.js
// @grant        none
// @match        https://www.dealabs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dealabs.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @require      https://cdn.jsdelivr.net/npm/autosize@4.0.2/dist/autosize.min.js
// @version      1.1.6
// ==/UserScript==

/* eslint-disable jsdoc/require-jsdoc */

function DealabsAio() {
  const utils = new Shuutils('dlb-clr')
  /** @type {string[]} */
  let excluders = (globalThis.localStorage[`${utils.id}.filter`] || 'my-keyword, other-keyword').split(',')
  let filter = ''
  const selectors = {
    deal: '.thread--type-list',
    dealList: '.js-threadList',
  }
  const cls = {
    filter: `${utils.id}-filter`,
  }
  const uselessElements = {
    banner: '.box--all-b, div.js-banner',
    buttons: '.threadGrid-body > .boxAlign-ai--all-c',
    data: '.threadGrid-footerMeta, .metaRibbon',
    flash: '.cept-threadUpdate',
    rightNav: '.listLayout-side',
    showMore: '.thread-link.linkPlain.text--b.overflow--wrap-off',
    subNav: '.subNavMenu--morph',
  }
  const uselessClasses = {
    descriptions: '.cept-description-container',
  }
  function cleanElements() {
    // @ts-expect-error it's ok
    for (const key of Object.keys(uselessElements)) for (const node of utils.findAll(uselessElements[key], document, true)) node.remove()
  }
  function cleanClasses() {
    // @ts-expect-error it's ok
    for (const key of Object.keys(uselessClasses)) for (const node of utils.findAll(uselessClasses[key], document, true)) node.classList = []
  }
  function insertStyles() {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = `
        .subNav {
            background-color: inherit;
            border: none;
            padding-top: 8px;
            padding-right: 10px;
        }
        .threadGrid {
            grid-template-rows: auto;
        }
        .threadGrid-headerMeta > div {
          padding-top: 1em;
        }
        .userHtml {
            font-size: 0.975rem;
        }
        .${cls.filter} {
            position: fixed;
            left: 7px;
            top: 62px;
            min-width: 200px;
            background-color: aliceblue;
            border-radius: 3px;
            padding: 5px;
            z-index: 100;
        }
        .cept-listing--list:not(#pagination) {
            display: flex;
            flex-direction: column;
        }
      `
    document.head.append('beforeend', styleTag)
  }
  /**
   * @param {string} text the text to check
   * @param {HTMLElement} element the element to style
   */
  function checkItem(text, element) {
    let isFound = false
    let remaining = excluders.length
    while (!isFound && remaining) {
      const exclude = excluders[remaining - 1] ?? ''
      isFound = text.includes(exclude)
      remaining -= 1
    }
    // eslint-disable-next-line no-magic-numbers
    if (isFound) utils.warn(`"${text.slice(0, 40)}..."`, `is excluded, it contains : "${excluders[remaining] || ''}"`)
    else if (utils.willDebug) element.style.backgroundColor = '#f0fbf0'
    element.style.opacity = isFound ? '0.3' : '1'
  }
  function checkItems() {
    utils.log('checking displayed items...')
    for (const element of utils.findAll(selectors.deal)) {
      const text = utils
        .readableString(element.textContent ?? '')
        .toLowerCase()
        .trim()
      checkItem(text, element)
    }
  }
  /** @param {boolean} [isFromFilter] Indicate if the update comes from the filter or not */
  function onExcludersUpdate(isFromFilter = false) {
    excluders = excluders.map(entry => entry.trim().toLowerCase()).filter(entry => entry.length)
    if (excluders.length <= 0) return
    utils.log('new excluders :', excluders)
    filter = excluders.join(', ')
    globalThis.localStorage[`${utils.id}.filter`] = filter
    if (!isFromFilter) {
      const filterElement = utils.findOne(`.${cls.filter}`)
      if (!(filterElement instanceof HTMLTextAreaElement)) {
        utils.showError('filterElement is not a textarea element')
        return
      }
      filterElement.value = filter
      // @ts-expect-error autosize is loaded in the window
      // oxlint-disable no-undef
      // biome-ignore lint/correctness/noUndeclaredVariables: it is declared in the global scope
      autosize.update(filterElement)
    }
    checkItems()
  }

  /**
   * Updates the excluders list based on the filter input.
   * @param {{ target: { value: string; }; }} event the event that triggered the change
   */
  function onFilterChange(event) {
    utils.log('filter changed !')
    excluders = event.target.value.split(',')
    onExcludersUpdate(true)
  }
  // eslint-disable-next-line no-magic-numbers
  const onFilterChangeDebounced = utils.debounce(onFilterChange, 500)
  function insertFilter() {
    utils.log('insert filter...')
    const container = utils.findFirst(selectors.dealList)
    if (!container) {
      utils.error('cannot inject excluders without container')
      return
    }
    const filterElement = document.createElement('textarea')
    filterElement.spellcheck = false
    filterElement.classList.add(cls.filter)
    filterElement.value = filter
    // @ts-expect-error autosize is loaded in the window
    // oxlint-disable no-undef
    // biome-ignore lint/correctness/noUndeclaredVariables: it is declared in the global scope
    autosize(filterElement)
    filterElement.addEventListener('keyup', () => onFilterChangeDebounced())
    container.before(filterElement)
  }

  function process() {
    utils.log('processing')
    cleanClasses()
    cleanElements()
    onExcludersUpdate()
  }
  function init() {
    utils.log('init !')
    insertStyles()
    insertFilter()
    process()
  }
  init()
  // eslint-disable-next-line no-magic-numbers
  const processDebounced = utils.debounce(process, 500)

  document.addEventListener('scroll', () => processDebounced())
}

if (globalThis.window) DealabsAio()
else module.exports = {}
