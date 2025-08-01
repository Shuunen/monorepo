import { colSpanClass, gridClass, theme } from './theme.utils'

it('theme A primary palette', () => {
  expect(theme.palette.primary).toMatchInlineSnapshot(`
    {
      "contrastText": "#fff",
      "dark": "rgb(97, 35, 153)",
      "light": "rgb(162, 91, 226)",
      "main": "#8b32db",
    }
  `)
})

it('gridClass A 1 column', () => {
  expect(gridClass(1)).toBe('md:grid-cols-1')
})

it('gridClass B 2 columns', () => {
  expect(gridClass(2)).toBe('md:grid-cols-2')
})

it('gridClass C 3 columns', () => {
  expect(gridClass(3)).toBe('md:grid-cols-3')
})

it('gridClass D 4 columns', () => {
  expect(gridClass(4)).toBe('md:grid-cols-4')
})

it('gridClass E 5 columns', () => {
  expect(gridClass(5)).toBe('md:grid-cols-5')
})

it('gridClass F 6 columns', () => {
  expect(gridClass(6)).toBe('md:grid-cols-6')
})

it('gridClass G 7 columns', () => {
  expect(gridClass(7)).toBe('md:grid-cols-7')
})

it('gridClass H 8 columns', () => {
  expect(gridClass(8)).toBe('md:grid-cols-8')
})

it('gridClass I 9 columns', () => {
  expect(gridClass(9)).toBe('md:grid-cols-9')
})

it('gridClass J 10 columns', () => {
  expect(gridClass(10)).toBe('md:grid-cols-10')
})

it('gridClass G default', () => {
  expect(gridClass()).toBe('md:grid-cols-1')
})

it('colSpanClass A 1 column', () => {
  expect(colSpanClass(1)).toBe('md:col-span-1')
})

it('colSpanClass B 2 columns', () => {
  expect(colSpanClass(2)).toBe('md:col-span-2')
})

it('colSpanClass C 3 columns', () => {
  expect(colSpanClass(3)).toBe('md:col-span-3')
})

it('colSpanClass D 4 columns', () => {
  expect(colSpanClass(4)).toBe('md:col-span-4')
})

it('colSpanClass E 5 columns', () => {
  expect(colSpanClass(5)).toBe('md:col-span-5')
})

it('colSpanClass F 6 columns', () => {
  expect(colSpanClass(6)).toBe('md:col-span-6')
})

it('colSpanClass G 7 columns', () => {
  expect(colSpanClass(7)).toBe('md:col-span-7')
})

it('colSpanClass H 8 columns', () => {
  expect(colSpanClass(8)).toBe('md:col-span-8')
})

it('colSpanClass I 9 columns', () => {
  expect(colSpanClass(9)).toBe('md:col-span-9')
})

it('colSpanClass J 10 columns', () => {
  expect(colSpanClass(10)).toBe('md:col-span-10')
})
