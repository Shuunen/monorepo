import { isBase64, parseBase64 } from './string-base64.js'

describe('string-base64', () => {
  it('isBase64 valid with data', () => {
    expect(isBase64('data:image/png;base64,iVBORw0KGgoYII=')).toBe(true)
  })
  it('isBase64 valid with data & double equal', () => {
    expect(isBase64('data:image/png;base64,iVBORw0KGgoYII==')).toBe(true)
  })
  it('isBase64 valid without data', () => {
    expect(isBase64('image/jpg;base64,iVBORw0KGgoYII=')).toBe(true)
  })
  it('isBase64 invalid, missing first char', () => {
    expect(isBase64('ata:image/png;base64,iVBORw0KGgoYII=')).toBe(false)
  })
  it('isBase64 invalid because empty', () => {
    expect(isBase64('')).toBe(false)
  })

  it('parseBase64 png image', () => {
    expect(parseBase64('data:image/png;base64,iVBORw0KGgoYII=')).toStrictEqual({ base64: 'iVBORw0KGgoYII=', size: 11, type: 'image/png' })
  })
  it('parseBase64 jpg image', () => {
    expect(parseBase64('image/jpg;base64,iVBORw0KGgoYII=')).toStrictEqual({ base64: 'iVBORw0KGgoYII=', size: 11, type: 'image/jpg' })
  })
  it('parseBase64 jpeg image', () => {
    expect(parseBase64('image/jpeg;base64,iVBORw0KGgoYII=')).toStrictEqual({ base64: 'iVBORw0KGgoYII=', size: 11, type: 'image/jpeg' })
  })
  it('parseBase64 invalid, missing type', () => {
    expect(parseBase64(';base64,iVBORw0KGgoYII')).toStrictEqual({ base64: '', size: 0, type: '' })
  })
  it('parseBase64 invalid because empty', () => {
    expect(parseBase64('')).toStrictEqual({ base64: '', size: 0, type: '' })
  })
})
