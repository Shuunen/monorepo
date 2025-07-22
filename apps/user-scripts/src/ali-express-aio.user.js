// ==UserScript==
// @name         AliExpress - All in one
// @author       Romain Racamier-Lafon
// @description  Bigger listing
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/aliexpress-aio.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/aliexpress-aio.user.js
// @grant        none
// @match        https://www.aliexpress.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aliexpress.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.0.4
// ==/UserScript==

// oxlint-disable no-magic-numbers
// oxlint-disable max-lines-per-function
/* eslint-disable consistent-return */
/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-returns */

/** @param {HTMLImageElement} img */
function extendsImage(img, size = 600) {
  // img.src = img.src.split('.jpg_')[0] + '.jpg'
  img.style.height = `${size}px`
  img.style.width = `${size}px`
  img.style.maxHeight = 'inherit'
  img.style.maxWidth = 'inherit'
}

function AliExpressAio() {
  const utils = new Shuutils('ali-express-aio')

  /** @param {HTMLElement} element */
  function processProductCard(element) {
    const img = element.querySelector('.item-img, img')
    if (!(img instanceof HTMLImageElement) || !img.src) {
      utils.error('cannot find image on card el', element)
      return
    }
    extendsImage(img)
    const wrapper = img.closest('.product-img, a')
    if (!(wrapper instanceof HTMLElement)) {
      utils.error('failed to find wrapper of', img)
      return
    }
    wrapper.style.height = 'inherit'
    wrapper.style.width = 'inherit'
    element.style.display = 'flex'
    const zone = element.querySelector('.right-zone')
    if (!(zone instanceof HTMLElement)) {
      utils.error('cannot find zone on card el', element)
      return
    }
    zone.style.paddingLeft = '16px'
    zone.style.marginTop = '16px'
    const sibling = zone.previousElementSibling
    if (sibling instanceof HTMLElement) sibling.style.width = '80%'
    element.classList.add('ali-aio-handled')
  }
  /** @param {HTMLElement} element */
  function processItemRow(element) {
    const img = element.querySelector('.pic-core')
    if (!(img instanceof HTMLImageElement) || !img.src) {
      utils.error('cannot find image on row el', element)
      return
    }
    utils.log('image src was', img.src)
    extendsImage(img, 500)
    utils.log('now image src is', img.src)
    let wrapper = img.closest('.pic')
    if (!wrapper) return utils.showError('failed to find wrapper of img')
    if (!(wrapper instanceof HTMLElement)) return utils.showError('wrapper is not an HTMLElement')
    wrapper.style.height = 'inherit'
    wrapper.style.width = 'inherit'
    wrapper = wrapper.parentElement
    if (!(wrapper instanceof HTMLElement)) return utils.showError('wrapper parent is not an HTMLElement')
    wrapper.style.height = 'inherit'
    wrapper.style.width = 'inherit'
    element.style.display = 'flex'
    element.style.height = 'inherit'
    element.classList.add('ali-aio-handled')
  }
  /**
   * Process the product cards
   */
  const processProductCards = () => utils.findAll('.list.product-card:not(.ali-aio-handled)').map(element => processProductCard(element))
  /**
   * Process the item rows
   */
  const processItemRows = () => utils.findAll('.items-list > .item:not(.ali-aio-handled)').map(element => processItemRow(element))
  /**
   * Process the page
   */
  const process = () => {
    utils.log('process...')
    processProductCards()
    processItemRows()
  }
  const processDebounced = utils.debounce(process, 1000)
  globalThis.addEventListener('scroll', () => processDebounced())
}

if (globalThis.window) AliExpressAio()
else module.exports = { extendsImage }
