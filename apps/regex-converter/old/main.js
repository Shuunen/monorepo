/* c8 ignore start */
// oxlint-disable no-magic-numbers, max-nested-callbacks, no-empty-function, require-returns, require-param
/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: it's temporary */

function debounce(function_, waitFor) {
  let timeout = setTimeout(() => {}, waitFor)
  return (...parameters) =>
    new Promise(resolve => {
      clearTimeout(timeout)
      timeout = setTimeout(() => resolve(function_(...parameters)), waitFor)
    })
}

// eslint-disable-next-line no-restricted-syntax
class App {
  constructor() {
    this.nbRules = 0
    this.applyRules = debounce(() => this.applyRulesSync(), 250)
    window.addEventListener('load', () => this.onDocumentLoad())
  }

  addRule(isActive = true, replaceIn = '', replaceOut = '') {
    this.nbRules += 1
    const element = this.getElementFromTemplate('rule')
    element.querySelector('.rule').dataset.ruleId = this.nbRules
    this.toggleRule(element.querySelector('.rule'), isActive, true)
    if (replaceIn) element.querySelector('input[name="replace-in"]').value = replaceIn
    if (replaceOut) element.querySelector('input[name="replace-out"]').value = replaceOut
    document.querySelector('.rules').append(element)
    this.applyRules()
  }

  applyRulesSync() {
    let text = this.textareaIn.value
    for (const element of document.querySelectorAll('.rule[data-rule-active="true"]')) {
      const replaceIn = element.querySelector('input[name="replace-in"]').value
      const replaceOut = element.querySelector('input[name="replace-out"]').value
      text = text.replace(new RegExp(replaceIn, 'gmu'), replaceOut)
    }
    this.textareaOut.value = text
  }

  // eslint-disable-next-line class-methods-use-this
  getElementFromTemplate(name) {
    const element = document.querySelector(`template[name="${name}"]`)
    if (!element) throw new Error(`failed to find template with name : ${name}`)
    return element.content.cloneNode(true)
  }

  insertSample() {
    this.textareaIn.value = [
      'This text will be processed & converted to the one on the right side.',
      'The rules below will be used to successively replace regular expressions.',
      'For example, the default rule 01 replace dots with cats !',
      'The second rule delete the word "right" by replacing him with nothing.',
      "The last sample rule prefix each lines with dashes :) but you'll have to enable it.",
      '',
      'Pretty neat right ?',
      '',
      'Tutorial is over, paste your own text, customize the rules, you can have more rules by adding them with the (+) button below :)`',
    ].join('\n')
  }

  onDocumentLoad() {
    this.setupElements()
    this.insertSample()
    this.addRule(true, String.raw`\.`, ' 😸')
    this.addRule(true, String.raw`right\s`, '')
    this.addRule(false, '([A-Z])', '- $1')
    this.addRule(false, '', '')
    this.addRule(false, '', '')
    this.addRule(false, '', '')
  }

  onRuleClick(event) {
    if (event.target.matches('[type="checkbox"]')) this.toggleRule(event.target.parentElement, event.target.checked)
  }

  setupElements() {
    this.textareaIn = document.querySelector('textarea[name="in"]')
    this.textareaOut = document.querySelector('textarea[name="out"]')
  }

  toggleRule(element, isActive, dontApply) {
    element.querySelector('input[type="checkbox"]').checked = isActive
    element.dataset.ruleActive = isActive
    if (dontApply) return
    this.applyRules()
  }
}

globalThis.app = new App()
