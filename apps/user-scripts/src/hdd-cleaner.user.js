// ==UserScript==
// @name         HDD Cleaner
// @author       Romain Racamier-Lafon
// @description  Remove unwanted hard drives disks
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/hdd-cleaner.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/hdd-cleaner.user.js
// @grant        none
// @match        https://keepa.com/*
// @match        https://www.amazon.co.uk/*
// @match        https://www.amazon.fr/*
// @match        https://www.dealabs.com/*
// @match        https://www.ldlc.com/*
// @match        https://www.materiel.net/*
// @match        https://www.topachat.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.fr
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.2.6
// ==/UserScript==

// oxlint-disable no-magic-numbers

function HddCleaner() {
  const id = 'hdd-clr'
  const app = {
    maxSize: 12_000,
    minSize: 4000, // in Gb or Go
  }
  const cls = {
    mark: `${id}-mark`,
  }
  const selectors = {
    desc: ['.colorTipContent', 'div[data-asin] span.a-text-normal', '.c-product__title', '.pdt-info .title-3 a', '.thread-title--list', 'article .libelle h3'].map(sel => `${sel}:not(.${cls.mark})`).join(','),
    price: ['.productPriceTableTdLargeS', '.a-offscreen', '.o-product__price', 'br + span.a-color-base', '.price > .price', '.thread-price', '[itemprop="price"]'].join(','),
    product: ['.productContainer', 'div[data-asin]', '.c-products-list__item', '.pdt-item', 'article.thread', 'article.grille-produit'].join(','),
  }
  const regex = {
    // biome-ignore lint/performance/useTopLevelRegex: FIX me later
    price: /(?<price>\d+[,.\\€]\d+)/u,
    // biome-ignore lint/performance/useTopLevelRegex: FIX me later
    size: /(?<size>\d+)\s?(?<unit>\w+)/u,
    sizes: /(?<size>\d+)\s?(?<unit>gb|go|tb|to)\b/giu,
  }

  const utils = new Shuutils(id)
  /**
   * Get the size from a text
   * @param {string} text the text to search in
   * @returns {number|false} the size in Go or false if not found
   */
  function getSize(text) {
    const matches = text.match(regex.sizes)
    if (!matches) return false
    let size = 0
    for (const match of matches) {
      let [, mSize, mUnit] = match.match(regex.size) ?? []
      // @ts-expect-error FIX ME later
      if (mUnit === 'to' || mUnit === 'tb') mSize *= 1000 // align sizes to Go, may be slightly different according to TO vs TB
      // @ts-expect-error FIX ME later
      if (mSize > size) size = Number.parseInt(mSize, 10)
    }
    return size
  }
  /**
   * Calculates the price per terabyte (To) for a product and inserts it into the description element,
   * along with a rating based on the price per To.
   *
   * @param {HTMLElement} productElement - The DOM element representing the product.
   * @param {HTMLElement} descElement - The DOM element where the price per size will be inserted.
   * @param {number} size - The size of the product in gigabytes (GB).
   * @returns {boolean} Returns true if the price per size was successfully inserted, false otherwise.
   */
  function insertPricePerSize(productElement, descElement, size) {
    const priceElement = utils.findOne(selectors.price, productElement)
    if (!priceElement) {
      utils.error('failed at finding price element')
      return false
    }
    utils.log('found price element :', priceElement.textContent)
    const matches = priceElement.textContent?.match(regex.price) ?? []
    if (matches.length !== 2) {
      utils.error('failed at finding price')
      return false
    }
    const price = Number.parseFloat(matches[0].replace(',', '.').replace('€', '.'))
    const pricePerTo = Math.round(price / (size / 1000))
    let rating = ''
    for (let index = 40; index > 20; index -= 5) if (pricePerTo < index) rating += '👍'
    rating += rating.length > 0 ? ' ' : ''
    utils.log('price found :', pricePerTo, '€ per To')
    descElement.textContent = `( ${rating}${pricePerTo}€ / to ) - ${descElement.textContent}`
    return true
  }

  // oxlint-disable max-lines-per-function
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: FIX me later
  function checkItems() {
    for (const descElement of utils.findAll(selectors.desc, document, true)) {
      if (!descElement.textContent) {
        utils.error('no text content found in description element', descElement)
        continue
      }
      const text = utils.readableString(descElement.textContent).toLowerCase().trim()
      const size = getSize(text)
      if (!size) {
        utils.error('fail at finding size')
        continue
      }
      utils.log('size found :', size, 'Go')
      const isSizeOk = app.minSize <= size && size <= app.maxSize
      utils.log('size is', isSizeOk ? 'good' : 'INVALID')
      const productElement = descElement.closest(selectors.product)
      if (!productElement) {
        utils.error('fail at finding closest product')
        continue
      }
      if (!(productElement instanceof HTMLElement)) {
        utils.error('product element is not an HTMLElement', productElement)
        continue
      }
      let willMarkItem = true
      if (isSizeOk) willMarkItem = insertPricePerSize(productElement, descElement, size)
      else productElement.style = utils.willDebug ? 'background-color: lightcoral; opacity: 0.6;' : 'display: none;'
      if (willMarkItem) {
        // only add mark class if check completed
        descElement.classList.add(cls.mark)
        utils.log('check complete, element marked')
      }
    }
  }
  function process() {
    utils.log('processing')
    checkItems()
  }
  const processDebounced = utils.debounce(process, 500)
  document.addEventListener('scroll', () => processDebounced())
  setTimeout(processDebounced, 1000)
}

if (globalThis.window) HddCleaner()
else module.exports = {}
