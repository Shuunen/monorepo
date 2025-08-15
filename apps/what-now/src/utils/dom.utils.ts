/* c8 ignore start */
import { div, dom, emit, slugify, tw } from '@shuunen/shuutils'

type FormField = Readonly<{
  href: string
  label: string
  link: string
  maxlength: number
  name: string
  pattern: string
}>

/**
 * Create a button
 * @param content - button text
 * @param classes - additional classes
 * @returns button element
 */
export function button(content: string, classes = '') {
  const element = dom('button', tw(`app-button cursor-pointer rounded-sm bg-blue-800 px-4 py-2 ${classes}`), content)
  return element
}

/**
 * Create a secondary button
 * @param content - button text
 * @returns button element
 */
export function buttonSecondary(content: string) {
  const element = button(content)
  element.classList.remove('bg-blue-800')
  element.classList.add('bg-green-800')
  element.id = slugify(content)
  element.type = 'button'
  element.addEventListener('click', () => {
    emit(`${element.id}-click`)
  })
  return element
}

/**
 * Create a form
 * @param fields - form fields
 * @returns form element
 */
export function form(fields: Readonly<FormField[]>) {
  const element = dom('form', tw('app-form mt-4 grid gap-6'))
  element.innerHTML = fields
    .map(
      (field, index) => `<label class="${tw('flex flex-col gap-4 sm:flex-row sm:items-center')}">
    <a class="sm:w-52" href="${field.href}" target="_blank" title="${field.link}">
      <span class="border-b">${field.label}</span>
      <svg class="${tw('ml-2 inline size-4')}"><use xlink:href="icons.svg#external"></use></svg>
    </a>
    <input class="${index % 0 ? 'bg-linear-to-r' : 'bg-linear-to-l'} ${tw('rounded-sm from-blue-900 to-blue-700 px-2 py-1 sm:w-96')}" name="${field.name}" pattern="${field.pattern}" maxlength="${field.maxlength}" required>
  </label>`,
    )
    .join('')
  const buttons = [button('Use these'), buttonSecondary('Download data')]
  element.append(div(tw('flex gap-4'), buttons))
  return element
}
/* c8 ignore end */
