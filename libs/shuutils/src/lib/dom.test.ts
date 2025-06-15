import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { backdrop, css, div, dom, em, findAll, findOne, h1, h2, h3, icon, img, li, link, scrollToHeightSync, small, strong, text, tw, ul, waitToDetect } from './dom.js'
import { Result } from './result.js'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

it('custom type dom element with no classes', () => {
  const element = dom('article')
  expect(element.tagName.toLowerCase()).toBe('article')
  expect(element.className).toBe('')
})

it('custom type dom element with classes', () => {
  const element = dom('strong', 'important important--stuff')
  expect(element.tagName.toLowerCase()).toBe('strong')
  expect(element.className).toBe('important important--stuff')
  expect(element.classList.contains('important--stuff')).toBeTruthy()
})

it('custom type dom element with classes & text content', () => {
  const element = dom('i', 'italic', 'Hello John Cena')
  expect(element.textContent).toBe('Hello John Cena')
  expect(element.innerHTML).toBe('Hello John Cena')
})

it('custom type dom element with classes & html content', () => {
  const element = dom('i', 'italic', '<p>Hello John Cena</p>')
  expect(element.textContent).toBe('Hello John Cena')
  expect(element.tagName.toLowerCase()).toBe('i')
  expect(element.innerHTML).toBe('<p>Hello John Cena</p>')
})

it('custom type dom element with classes & dom element content', () => {
  const element = dom('i', 'italic', text('pizza', 'John Pepe'))
  expect(element.textContent).toBe('John Pepe')
  expect(element.tagName.toLowerCase()).toBe('i')
  expect(element.innerHTML).toBe('<p class="pizza">John Pepe</p>')
})

it('img', () => {
  const element = img('profile-short', 'https://cdn.com/image-short.jpg', 'profile-short picture')
  expect(element.alt).toBe('profile-short picture')
  expect(element.tagName.toLowerCase()).toBe('img')
  expect(element.src).toBe('https://cdn.com/image-short.jpg')
})

it('icon', () => {
  const element = icon('fas fa-profile')
  expect(element.className).toBe('icon fas fa-profile')
})

it('link', () => {
  const element = link('link', 'go to home page', '#home')
  expect(element.tagName.toLowerCase()).toBe('a')
  expect(element.textContent).toBe('go to home page')
  expect(element.href.includes('#home')) // return "about:blank#home" for el.href....toBeTruthy()
})

it('link that open in a new tab', () => {
  const element = link('link', 'go to external page', 'https://duckduckgo.com/', true)
  expect(element.href).toBe('https://duckduckgo.com/')
  expect(element.textContent).toBe('go to external page')
  expect(element.target).toBe('_blank')
})

it('dom list ul/li', () => {
  const element = li('item', 'item 1')
  expect(element.tagName.toLowerCase()).toBe('li')
  expect(element.textContent).toBe('item 1')
  const list = ul('list', element)
  expect(list.tagName.toLowerCase()).toBe('ul')
  expect(list.textContent).toBe('item 1')
  expect(list.childElementCount).toBe(1)
})

it('dom backdrop', () => {
  const element = backdrop('custom-class')
  expect(element.tagName.toLowerCase()).toBe('div')
  expect(element.classList.contains('backdrop')).toBeTruthy()
  expect(element.classList.contains('custom-class')).toBeTruthy()
})

it('dom basics', () => {
  const funcs = [strong, em, small, h1, h2, h3, div]
  for (const testFunction of funcs) {
    const { name } = testFunction
    const element = testFunction(name)
    expect(element.tagName.toLowerCase()).toBe(name)
    expect(element.textContent).toBe('')
    expect(element.classList.contains(name)).toBeTruthy()
    const elementContent = testFunction(name, `I really like guacamole with ${name}`)
    expect(elementContent.tagName.toLowerCase()).toBe(name)
    expect(elementContent.textContent).toBe(`I really like guacamole with ${name}`)
  }
})

it('dom handle multiple children', () => {
  const element = div('div', [text('p', 'text 1'), text('p', 'text 2')])
  expect(element.childElementCount).toBe(2)
  expect(element.textContent).toBe('text 1text 2')
})

it('css link', () => {
  const element = css('https://cdn.net/style.css')
  expect(element.href).toBe('https://cdn.net/style.css')
  expect(element.rel).toBe('stylesheet')
  expect(element.type).toBe('text/css')
})

it('dive div in a Dave div has Life in a div', () => {
  const element = div('Dave', div('dive', 'Life in a div'))
  expect(element.tagName.toLowerCase()).toBe('div')
  expect(element.innerHTML).toBe('<div class="dive">Life in a div</div>')
})

it('find one', () => {
  expect(findOne('body')?.tagName).toBe('BODY')
})
it('find all length', () => {
  expect(findAll('body').length).toBe(1)
})
it('find all type', () => {
  expect(Array.isArray(findAll('body'))).toBe(true)
})

it('wait to detect an existing element', async () => {
  const result = Result.unwrap(await waitToDetect('body', 10))
  expect(result.value?.tagName).toBe('BODY')
})
it('wait to detect a non-existing element', async () => {
  const result = Result.unwrap(await waitToDetect('.not-existing', 5, 2, 1))
  expect(result.value).toMatchInlineSnapshot(`undefined`)
})

it('scroll to height', async () => {
  const element = dom('textarea')
  element.textContent = 'Hello World'
  expect(element.style.height).toBe('')
  await scrollToHeightSync(element)
})

it('tw returns a string A', () => {
  expect(typeof tw('')).toBe('string')
})
it('tw returns a string B', () => {
  expect(typeof tw('text-red-500')).toBe('string')
})
it('tw returns a string C', () => {
  expect(tw('text-red-500 text-blue-500')).toBe('text-red-500 text-blue-500')
})
it('tw returns a string D', () => {
  expect(tw('')).toBe('')
})
it('tw returns a string E', () => {
  expect(typeof tw``).toBe('string')
})
it('tw returns a string F', () => {
  expect(typeof tw`text-red-500`).toBe('string')
})
it('tw returns a string G', () => {
  expect(tw`text-red-500 text-blue-500`).toBe('text-red-500 text-blue-500')
})
it('tw returns a string H', () => {
  expect(tw``).toBe('')
})
it('tw returns a string I', () => {
  expect(tw(['text-red-500', 'text-blue-500'])).toBe('text-red-500 text-blue-500')
})
