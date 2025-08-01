// ==UserScript==
// @name         Temu Takeout - Get data with you
// @author       Shuunen
// @description  This script let you export data from Temu
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/temu-takeout.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/temu-takeout.user.js
// @grant        none
// @match        https://www.temu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=temu.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/user-scripts/src/mb-import-utils.js
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.1.2
// ==/UserScript==

/**
 * Get the data from the page.
 * @returns {Record<'brand' | 'details' | 'name' | 'photo' | 'price' | 'reference', string>} The data.
 */
function getData() {
  // @ts-expect-error rawData is not defined but exists in the page
  // oxlint-disable no-undef
  // biome-ignore lint/correctness/noUndeclaredVariables: rawData is not defined but exists in the page
  const { store } = rawData
  if (store === undefined) throw new Error('No rawData.store in page')
  if (store.googleShoppingJson !== undefined) {
    const data = JSON.parse(store.googleShoppingJson)
    return {
      brand: data.brand.name,
      details: data.description,
      name: data.name,
      photo: data.image,
      price: data.offers.price,
      reference: data.sku,
    }
  }
  if (store.seoPageAltInfo === undefined) throw new Error('No rawData.store.seoPageAltInfo in page')
  if (store.goods === undefined) throw new Error('No rawData.store.goods in page')
  return {
    brand: 'Temu',
    details: store.seoPageAltInfo.pageAlt,
    name: store.seoPageAltInfo.pageAlt,
    photo: store.goods.hdThumbUrl,
    // oxlint-disable-next-line no-magic-numbers
    price: String(store.goods.minOnSalePrice / 100),
    reference: store.goods.itemId,
  }
}

function TemuTakeout() {
  const utils = new Shuutils('ldl-tko')
  /**
   * Handles the form submission event.
   * @param {object} values - The form values.
   */
  async function onSubmit(values) {
    utils.log('Form submitted with', { values })
    await utils.copyToClipboard(values)
    utils.showSuccess('Data copied to clipboard')
  }
  /**
   * Start the takeout process.
   */
  function startTakeout() {
    const data = getData()
    utils.log('found data', data)
    const form = createMbForm({ id: utils.id, title: 'Temu Takeout' }, onSubmit)
    addMbField(form, 'name', data.name)
    addMbField(form, 'details', data.details)
    addMbField(form, 'reference', data.reference)
    addMbField(form, 'photo', data.photo)
    addMbField(form, 'brand', data.brand)
    addMbField(form, 'price', Math.round(Number.parseFloat(data.price.replace(',', '.'))).toString())
    addMbSubmit(form, 'Copy to clipboard')
    document.body.append(form)
  }
  /**
   * Initialize the script.
   */
  function init() {
    startTakeout()
  }
  const processDebounceTime = 500
  const processDebounced = utils.debounce(init, processDebounceTime)
  processDebounced()
  utils.onPageChange(processDebounced)
}

if (globalThis.window) TemuTakeout()
else module.exports = { getData }
