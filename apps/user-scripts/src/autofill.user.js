// ==UserScript==
// @name         Autofill
// @author       Romain Racamier-Lafon
// @description  Simply fill your login everywhere
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/autofill.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/autofill.user.js
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=autofill.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.0.5
// ==/UserScript==

/**
 * Trigger a change event on an input element
 * @param {HTMLInputElement} element the input element
 * @returns {void}
 */
function triggerChange(element) {
  element.dispatchEvent(new KeyboardEvent('change'))
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}

function Autofill() {
  const utils = new Shuutils('auto-fill')
  const data = {
    email: atob('cm9tYWluLnJhY2FtaWVyQGdtYWlsLmNvbQ=='),
    phone: atob('NjU4NDc2Nzg4'),
  }
  const selectors = {
    login: 'input[id*="mail"], input[name*="mail"], input[name*="ogin"], input[type*="mail"], input[name*="user"], input[name*="ident"]',
    phone: 'input[type*="phone"], input[name*="phone"], input[name*="mobile"], input[name*="tel"], input[inputmode="tel"]',
    phoneCountry: '[id="areaCode-+33"]',
  }
  /**
   * Get the inputs matching the selector
   * @param {string} selector the selector to match
   * @returns {HTMLInputElement[]} the inputs if any
   */
  function getInputs(selector) {
    // @ts-expect-error it's ok ^^
    return utils.findAll(selector, document, true)
  }
  /**
   * Fill the login input with the email
   */
  function fillLogin() {
    for (const input of getInputs(selectors.login)) {
      if (input.type === 'password' || input.value.length > 0) continue
      input.value = data.email
      triggerChange(input)
      utils.log('filled login', input)
    }
  }
  /**
   * Fill the phone input with the phone number
   */
  function fillPhone() {
    // select the right country before filling the phone
    const country = utils.findOne(selectors.phoneCountry, document, true)
    if (country === undefined) {
      utils.debug('no country selector found')
      return
    }
    country.click()
    for (const input of getInputs(selectors.phone)) {
      if (input.value.length > 0) continue
      input.value = data.phone
      triggerChange(input)
      utils.log('filled phone', input)
    }
  }
  /**
   * Init the autofill
   */
  function init() {
    utils.log('autofill start...')
    fillLogin()
    fillPhone()
  }
  // oxlint-disable-next-line no-magic-numbers
  const initDebounced = utils.debounce(init, 1000)
  if (document.location.hostname === 'localhost') return
  utils.onPageChange(() => initDebounced())
}

if (globalThis.window) Autofill()
else module.exports = { triggerChange }
