import { nbDaysInWeek, nbSpacesIndent } from './constants.js'
import { Result } from './result.js'
import { sleep } from './sleep.js'

type DomContent = Node | Node[] | string

/**
 * Generate a dom element
 * @param type the type of the element, like 'div' or 'span'
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated dom element
 */
export function dom<Tag extends keyof HTMLElementTagNameMap>(type: Tag, classes = '', content: DomContent = '') {
  const element = document.createElement(type)
  element.className = classes
  if (typeof content === 'string') element.innerHTML = content
  else if (content instanceof Node) element.append(content)
  else for (const node of content) element.append(node)
  return element
}

/**
 * Generate an image <img> element
 * @param classes the custom classes to add to the element
 * @param source the source of the image
 * @param alt the alt text of the image
 * @returns the generated image element
 */
export function img(classes: string, source: string, alt: string) {
  const element = dom('img', classes)
  element.alt = alt
  element.src = source
  return element
}

/**
 * Generate an icon element with a <i> tag
 * @param classes the custom classes to add to the element
 * @returns the generated icon element
 */
export function icon(classes = '') {
  return dom('i', `icon ${classes}`)
}

/**
 * Generate a link <a> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @param href the href of the link
 * @param willOpenInNewTab true if the link should open in a new tab
 * @returns the generated link element
 */
// oxlint-disable-next-line max-params
export function link(classes: string, content: DomContent, href: string, willOpenInNewTab = false) {
  const element = dom('a', classes, content)
  element.href = href
  if (willOpenInNewTab) element.target = '_blank'
  return element
}

/**
 * Generate a paragraph <p> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated paragraph element
 */
export function text(classes: string, content: DomContent = '') {
  return dom('p', classes, content)
}

/**
 * Generate a <strong> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated strong element
 */
export function strong(classes: string, content: DomContent = '') {
  return dom('strong', classes, content)
}

/**
 * Generate an emphasis <em> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated emphasis element
 */
export function em(classes: string, content: DomContent = '') {
  return dom('em', classes, content)
}

/**
 * Generate a <small> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated small element
 */
export function small(classes: string, content: DomContent = '') {
  return dom('small', classes, content)
}

/**
 * Generate a <h1> heading element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated heading element
 */
export function h1(classes: string, content: DomContent = '') {
  return dom('h1', classes, content)
}

/**
 * Generate a <h2> heading element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated heading element
 */
export function h2(classes: string, content: DomContent = '') {
  return dom('h2', classes, content)
}

/**
 * Generate a <h3> heading element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated heading element
 */
export function h3(classes: string, content: DomContent = '') {
  return dom('h3', classes, content)
}

/**
 * Generate a <ul> list element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated list element
 */
export function ul(classes: string, content: DomContent = '') {
  return dom('ul', classes, content)
}

/**
 * Generate a <li> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated list element
 */
export function li(classes: string, content: DomContent = '') {
  return dom('li', classes, content)
}

/**
 * Generate a <div> element
 * @param classes the custom classes to add to the element
 * @param content the content of the element, can be a string, another dom element or an array of dom elements
 * @returns the generated div element
 */
export function div(classes: string, content: DomContent = '') {
  return dom('div', classes, content)
}

/**
 * Generate a link to a css/stylesheet file
 * @param href the href/src
 * @returns the link element, ex: &lt;link type="text/css" href="../styles.css" rel="stylesheet" />
 */
export function css(href: string) {
  const element = dom('link')
  element.href = href
  element.rel = 'stylesheet'
  element.type = 'text/css'
  return element
}

/**
 * QuerySelector wrapper with a short-hand syntax
 * @param selector the css-like selector to find the element
 * @param context the dom context to search in
 * @returns the element or null if not found
 */
export function findOne<Type extends Element = HTMLElement>(selector: string, context: Document | HTMLElement = document) {
  return context.querySelector<Type>(selector)
}

/**
 * QuerySelectorAll with a short-hand syntax that return an Array instead of NodeList
 * @param selector the css-like selector to find the elements
 * @param context the context to search in, document by default
 * @returns array of found elements
 */
export function findAll(selector: string, context: Document | HTMLElement = document) {
  return Array.from(context.querySelectorAll(selector))
}

/**
 * Wait for an element to exists in DOM
 * @param selector the css-like selector to find the element, ex: '#super-id' or '.a-class'
 * @param wait time to wait in ms between each try, default 500ms
 * @param nbTries used for recursion, do not use it
 * @param maxTry the max number of tries, default 5
 * @returns the element or undefined if not found
 */
// oxlint-disable-next-line max-params
export async function waitToDetect(selector: string, wait = 500, nbTries = 0, maxTry = 5) {
  await sleep(wait)
  const element = findOne(selector)
  if (element) return Result.ok(element)
  /* v8 ignore next 3 -- @preserve */
  if (nbTries > maxTry) return Result.error(`stop searching after 5 fails to detect : "${selector}"`)
  return waitToDetect(selector, wait, nbTries + 1, maxTry)
}

/**
 * Set an element height to its content height, you should use it debounced like :
 * ```
 * const scrollToHeight = debounce((element: HTMLElement) => scrollToHeightSync(element), 100)
 * ```
 * @param element the element to set height to
 */
export async function scrollToHeightSync(element: HTMLElement) {
  const initial = element.style.height
  element.style.height = 'inherit'
  const target = element.scrollHeight + nbSpacesIndent
  element.style.height = initial
  await sleep(nbDaysInWeek)
  element.style.height = `${target}px`
}

/**
 * Generate a backdrop element
 * @param classes the classes to add to the backdrop
 * @returns the backdrop element
 */
export function backdrop(classes: string) {
  return div(`backdrop ${classes} fixed top-0 left-0 z-10 w-full h-full opacity-0 pointer-events-none`)
}

/**
 * Tw is a callee mock for tailwindcss, it will return the classes as a string
 * @param classes the classes to return
 * @returns the classes as a string
 */
export function tw(classes: Readonly<string[]> | Readonly<TemplateStringsArray> | string) {
  if (typeof classes === 'string') return classes
  return classes.join(' ')
}
