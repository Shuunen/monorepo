import { capNesting } from './object-cap-nesting.js'

const myObject = {
  address: {
    building: '123',
    buildingNumber: 42,
    buildingType: 'house',
  },
  advanced: {
    base: {
      caporalName: null, // eslint-disable-line unicorn/no-null
      color: 'red',
      colorType: 'primary',
      current: true, // eslint-disable-line @typescript-eslint/naming-convention
      details: {
        description: 'This is a description',
        descriptionType: 'long',
      },
    },
    baseArray: [69, 'apple', 4, 'u'],
  },
  age: 12,
  avatar: 'https://example.com/avatar.png',
}

it('capNesting A - Level 1', () => {
  expect(capNesting(myObject, 1)).toMatchInlineSnapshot(`
    {
      "address": "...",
      "advanced": "...",
      "age": "...",
      "avatar": "...",
    }
  `)
})

it('capNesting B - Level 2', () => {
  expect(capNesting(myObject, 2)).toMatchInlineSnapshot(`
    {
      "address": {
        "building": "...",
        "buildingNumber": "...",
        "buildingType": "...",
      },
      "advanced": {
        "base": "...",
        "baseArray": "...",
      },
      "age": 12,
      "avatar": "https://example.com/avatar.png",
    }
  `)
})

it('capNesting C - Cap more than available', () => {
  expect(capNesting(myObject, 10)).toStrictEqual(myObject)
})
