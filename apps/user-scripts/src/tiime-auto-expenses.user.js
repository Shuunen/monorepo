// ==UserScript==
// @name         Tiime Auto Expenses Filler
// @author       Romain Racamier-Lafon
// @description  Generate expenses automatically
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/tiime-auto-expenses.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/tiime-auto-expenses.user.js
// @match        https://apps.tiime.fr/companies/*/expense/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiime.fr
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.1.3
// ==/UserScript==

// oxlint-disable max-lines-per-function
// cSpell:disable

const id = 'tim-aex'

const delays = {
  large: 500,
  medium: 300,
  small: 100,
}

/**
 * Create a button element
 * @param {string} label the button label
 * @returns {HTMLButtonElement} the button element
 */
function createButton(label = '') {
  const button = document.createElement('button')
  button.id = id
  button.textContent = label
  button.type = 'button'
  button.setAttribute('tiime-button', '')
  return button
}

function TiimeAutoExpenses() {
  const utils = new Shuutils(id)
  const elements = {
    createNdfBtn: createButton(''),
    newExpenseBtn: createButton(''),
  }
  const selectors = {
    /** Ajouter une dépense" dans la popup après avoir cliqué sur "Creer une note de frais" */
    chooseExpenseBtn: 'span + .tiime-background-secondary-surface',
    /** "Creer une note de frais" le bouton sur la page de demarrage */
    createNdfBtn: '.action-bar-actions > [tiime-button][accent]',
    /** Ajouter un label */
    formAddLabelBtn: 'app-advanced-expense-side-panel button[data-cy="label__btn-add"]',
    /** Montant de la dépense */
    formInputAmount: 'app-advanced-expense-side-panel [formcontrolname="amount"]',
    /** Commentaire de la dépense */
    formInputComment: 'app-advanced-expense-side-panel [formcontrolname="comment"]',
    /** Date de la dépense */
    formInputDate: 'app-advanced-expense-side-panel [formcontrolname="date"]',
    /** Nom de la dépense */
    formInputName: 'app-advanced-expense-side-panel [formcontrolname="expenseName"]',
    /** Montant de la TVA */
    formInputVatAmount: 'app-advanced-expense-side-panel [formcontrolname="vatAmount"]',
    /** (+) Nouvelle dépense */
    newExpenseBtn: 'app-expense-report-advanced-expenses button[tiime-button][neutral]',
    /** Suivant */
    nextButton: 'app-fixed-footer-bar > button + button[tiime-button][accent]',
    tableRow: 'tbody > tr',
    tableRowAmountInput: '[placeholder="Montant"]',
    tableRowDate: '.mat-datepicker-input',
    tableRowDateLastDay: 'tbody.mat-calendar-body > tr:last-of-type > td:last-of-type > button',
    tableRowDatePrevMonth: '.mat-calendar-previous-button',
    tableRowHasCommentIcon: 'mat-icon.icon-tag-and-comment',
    tableRowLabel: '[data-cy="label__btn-add"]',
    tableRowLabelFirstChip: '[data-cy="label__search-result-0"]',
    tableRowLabelInput: '[data-cy="label__input-search"]',
    tableRowMenu: 'button.mat-mdc-menu-trigger',
    tableRowMenuComment: '.mat-mdc-menu-item:nth-child(2)',
    textareaComment: 'textarea[placeholder="Ajouter un commentaire"]',
    textareaCommentValidate: '.mat-mdc-dialog-actions button[tiime-button][accent]',
  }
  async function setDate() {
    utils.log('setting date to last day of previous month')
    const input = utils.findOne(selectors.formInputDate)
    if (input === undefined) {
      utils.showError('formInputDate not found')
      return
    }
    const currentValue = input instanceof HTMLInputElement ? input.value : ''
    if (currentValue !== '') {
      utils.log('date already set to', currentValue)
      return
    }
    input.click()
    const previous = await utils.waitToDetect(selectors.tableRowDatePrevMonth)
    if (previous === undefined) {
      utils.showError('previous button not found')
      return
    }
    previous.click()
    const lastDay = await utils.waitToDetect(selectors.tableRowDateLastDay)
    if (lastDay === undefined) {
      utils.showError('lastDay not found')
      return
    }
    lastDay.click()
    utils.log('date set to the', lastDay.textContent, 'of previous month')
  }
  /**
   * @param {string} label the label to set, like "Abonnement Internet"
   * @returns {Promise<void>}
   */
  async function setLabel(label) {
    utils.log(`setting label "${label}"`)
    const input = await utils.waitToDetect(selectors.formInputName)
    if (input === undefined) {
      utils.showError('formInputName not found')
      return
    }
    if (!(input instanceof HTMLInputElement)) {
      utils.showError('formInputName is not an input element')
      return
    }
    // input.value = label
    // input.dispatchEvent(new Event('input'))
    await utils.fillLikeHuman(input, label)
    utils.log('label set to', input.value)
  }
  /**
   * @param {number} amount the amount to set, like 22.47
   */
  async function setAmount(amount) {
    utils.log(`setting amount "${amount}"`)
    const input = utils.findOne(selectors.formInputAmount)
    if (input === undefined) {
      utils.showError('formInputAmount not found')
      return
    }
    if (!(input instanceof HTMLInputElement)) {
      utils.showError('formInputAmount is not an input element')
      return
    }
    // await utils.fillLikeHuman(input, amount.toString().replace('.', ',')) // fail with "The specified value "25," cannot be parsed, or is out of range."
    // await utils.fillLikeHuman(input, amount.toString()) // fail with "The specified value "25." cannot be parsed, or is out of range."
    // await utils.fillLikeHuman(input, '42')
    input.focus()
    input.value = amount.toString()
    await utils.sleep(delays.small)
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
    await utils.sleep(delays.small)
    input.blur()
    utils.log('amount set to', input.value)
    const vatInput = utils.findOne(selectors.formInputVatAmount)
    if (vatInput === undefined) {
      utils.showError('formInputVatAmount not found')
      return
    }
    if (!(vatInput instanceof HTMLInputElement)) {
      utils.showError('formInputVatAmount is not an input element')
      return
    }
    await utils.fillLikeHuman(vatInput, '0')
    utils.log('vat amount set to', vatInput.value)
  }
  /**
   * Set the comment for an expense
   * @param {string} comment the comment to set
   */
  async function setComment(comment) {
    utils.log(`setting comment "${comment}"`)
    const textarea = await utils.findOne(selectors.formInputComment)
    if (textarea === undefined) {
      utils.showError('formInputComment not found')
      return
    }
    if (!(textarea instanceof HTMLTextAreaElement)) {
      utils.showError('formInputComment is not a textarea element')
      return
    }
    // await utils.fillLikeHuman(textarea, comment) // fail : nothing appears
    await utils.sleep(delays.small)
    textarea.value = comment
    await utils.sleep(delays.small)
    textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
    await utils.sleep(delays.small)
    textarea.blur()
    utils.log('comment set to', textarea.value)
  }
  /**
   * Check if an expense is already filled
   * @param {string} label the label to check
   * @param {number} amount the amount to check
   * @returns {boolean} true if the expense is already filled
   */
  function isExpenseFilled(label, amount) {
    return utils.findAll('[data-cy="label-chip__txt-label-name"]').some(chip => {
      const text = chip.textContent?.trim() ?? ''
      const hasSameLabel = text === label
      if (!hasSameLabel) return false
      const row = chip.closest('tr')
      if (row === null) {
        utils.showError('row closest to chip not found')
        return false
      }
      const input = row.querySelector(selectors.tableRowAmountInput)
      if (!(input instanceof HTMLInputElement)) {
        utils.showError('amount input not found')
        return false
      }
      const hasSameAmount = input.value === amount.toString()
      if (!hasSameAmount) utils.showError(`found label "${label}" but current amount is ${input.value} instead of ${amount.toString()}`)
      return hasSameLabel // still return hasSameLabel/true even if amount is different because we want to skip this expense
      // so we consider it as already filled
    })
  }
  async function createNdf() {
    elements.createNdfBtn.click()
    const addExpenseOptionBtn = await utils.waitToDetect(selectors.chooseExpenseBtn)
    if (addExpenseOptionBtn === undefined) {
      utils.showError('addExpenseOptionBtn not found')
      return
    }
    addExpenseOptionBtn.click()
    const nextButton = await utils.waitToDetect(selectors.nextButton)
    if (nextButton === undefined) {
      utils.showError('nextButton not found')
      return
    }
    nextButton.click()
    const newExpenseBtn = await utils.waitToDetect(selectors.newExpenseBtn)
    if (newExpenseBtn === undefined) {
      utils.log('no add expense button found on this page')
      return
    }
    if (!(newExpenseBtn instanceof HTMLButtonElement)) {
      utils.showError('newExpenseBtn is not a button element')
      return
    }
    elements.newExpenseBtn = newExpenseBtn
    utils.log('newExpenseBtn found and stored', elements.newExpenseBtn)
    utils.log('ndf created')
  }

  /**
   * Add an expense to the page
   * @param {string} label the label
   * @param {string} comment the comment
   * @param {number} amount the amount
   */
  async function addExpense(label, comment, amount) {
    // console.groupEnd()
    await utils.sleep(delays.medium)
    if (isExpenseFilled(label, amount)) {
      utils.log(`expense already filled : ${label}`)
      return
    }
    elements.newExpenseBtn.click()
    await setDate()
    await setLabel(label)
    await setAmount(amount)
    if (comment !== '') await setComment(comment)
  }
  /**
   * Add multiple expenses from the clipboard
   */
  async function addExpenses() {
    const lines = await utils.readClipboard()
    if (lines.trim() === '') {
      utils.showError('no data found in clipboard')
      return
    }
    if (!lines.includes('\t')) {
      utils.showError('tabs not found in data, does not seems like you copied spreadsheet cells')
      return
    }
    const [headers, ...expenses] = lines.split('\n').map(line => line.split('\t'))
    const headerHash = headers?.join('').trim() ?? ''
    const headerHashExpected = 'FraisCommentaireMontant'
    if (headerHash !== headerHashExpected) {
      utils.showError(`header not found or not matching, expected "${headerHashExpected}" but got "${headerHash}"`)
      return
    }
    if (expenses.length === 0) {
      utils.showError('no expenses found')
      return
    }
    utils.log('adding expenses...', expenses)
    const subset = expenses
    for (const [label = '', comment = '', amount = ''] of subset) {
      const amountNumber = Number.parseFloat(amount.replace(',', '.'))
      // oxlint-disable-next-line no-await-in-loop
      await addExpense(label, comment, amountNumber)
    }
    utils.showSuccess('expenses added 😎')
  }
  /**
   * Initialize the script
   */
  async function init() {
    const createNdfBtn = await utils.waitToDetect(selectors.createNdfBtn)
    if (createNdfBtn === undefined) {
      utils.log('no add expense button found on this page')
      return
    }
    if (!(createNdfBtn instanceof HTMLButtonElement)) {
      utils.showError('createNdfBtn is not a button element')
      return
    }
    elements.createNdfBtn = createNdfBtn
    const hasAddAll = utils.findOne(`#${id}`, document.body, true)
    if (hasAddAll !== undefined) {
      utils.log('button already injected')
      return
    }
    const addAll = createButton('Ajouter les dépenses courantes 😎')
    addAll.addEventListener('click', async () => {
      await createNdf()
      await addExpenses()
    })
    if (createNdfBtn.parentElement === null) {
      utils.showError('button parent element not found')
      return
    }
    createNdfBtn.parentElement.append(addAll)
    utils.showLog('button injected')
  }
  const initDebounced = utils.debounce(init, delays.large)
  initDebounced()
  utils.onPageChange(initDebounced)
}

if (globalThis.window) TiimeAutoExpenses()
