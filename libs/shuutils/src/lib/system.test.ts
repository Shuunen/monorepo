import { toUnixPath } from './system.js'

it('toUnixPath A empty', () => {
  expect(toUnixPath('')).toMatchInlineSnapshot(`""`)
})

it('toUnixPath B /', () => {
  expect(toUnixPath('/')).toMatchInlineSnapshot(`"/"`)
})

it('toUnixPath C /a', () => {
  expect(toUnixPath('/a')).toMatchInlineSnapshot(`"/a"`)
})

it('toUnixPath D windows style', () => {
  expect(toUnixPath(String.raw`C:\Users\Huei\AppData\Roaming`)).toMatchInlineSnapshot(`"C:/Users/Huei/AppData/Roaming"`)
})
