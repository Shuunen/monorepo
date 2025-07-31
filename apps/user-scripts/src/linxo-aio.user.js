// ==UserScript==
// @name         Linxo AIO - Get data with you
// @author       Shuunen
// @description  This script help me improve my Linxo user experience
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/linxo-aio.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/linxo-aio.user.js
// @grant        none
// @match        https://wwws.linxo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linxo.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @require      https://unpkg.com/rough-notation/lib/rough-notation.iife.js
// @version      1.1.0
// ==/UserScript==

const authorizedCategories = new Set([
  // Vie courante
  'Alimentation, supermarché',
  'Snacks, repas au travail',
  'Dépenses vie courante',
  'Internet, TV, télécom',
  'Shopping/e-Commerce',
  // Logement, energies
  'Electricité, gaz, chauffage',
  'Assurance logement',
  'Loyer',
  // Santé, prévoyance
  'Cotis mutuelle, prévoyance',
  // Voyages, train, hôtels
  // Impôts, taxe habitation
  'Impôts',
  // Hors budget
  "Salaire/Revenus d'activité",
])

function LinxoAio() {
  /* globals Shuutils, RoughNotation */
  const utils = new Shuutils('linxo-aio', true)
  const processed = `${utils.id}-processed`
  const selectors = {
    labels: `td > div > img + div[title]:not(.${processed})`,
  }
  /**
   * Check for wrong categories in the page
   */
  function checkWrongCategories() {
    const labels = utils.findAll(selectors.labels)
    for (const element of labels) {
      const label = element.getAttribute('title')
      if (label === null || authorizedCategories.has(label)) continue
      element.classList.add(processed)
      element.dataset.highlightReason = 'wrong-category'
      // oxlint-disable no-undef
      // biome-ignore lint/correctness/noUndeclaredVariables: RoughNotation exists
      const annotation = RoughNotation.annotate(element, { color: 'yellow', type: 'highlight' })
      annotation.show()
      // oxlint-enable no-undef
    }
  }
  /**
   * Process the page
   */
  function process() {
    utils.log('processing')
    checkWrongCategories()
  }
  const processDebounceTime = 500
  const processDebounced = utils.debounce(process, processDebounceTime)
  document.addEventListener('scroll', () => processDebounced())
  utils.onPageChange(processDebounced)
  setTimeout(processDebounced, processDebounceTime)
}

if (globalThis.window) LinxoAio()
else module.exports = {}
