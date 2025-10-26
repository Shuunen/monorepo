import { capNesting } from './object-cap-nesting.js'

describe('object-cap-nesting utils', () => {
  const myObject = {
    address: {
      building: '123',
      buildingNumber: 42,
      buildingType: 'house',
    },
    advanced: {
      base: {
        caporalName: null,
        color: 'red',
        colorType: 'primary',
        current: true,
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

  it('capNesting A level 1', () => {
    expect(capNesting(myObject, 1)).toMatchInlineSnapshot(`
    {
      "address": "...",
      "advanced": "...",
      "age": "...",
      "avatar": "...",
    }
  `)
  })

  it('capNesting B level 2', () => {
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

  it('capNesting C cap more than available', () => {
    expect(capNesting(myObject, 10)).toStrictEqual(myObject)
  })

  it('capNesting D deep array', () => {
    const objectWithDeepArray = {
      items: [
        { id: 1, name: 'first' },
        { id: 2, name: 'second', nested: { deep: 'value' } },
      ],
    }
    expect(capNesting(objectWithDeepArray, 2)).toMatchInlineSnapshot(`
    {
      "items": [
        "...",
        "...",
      ],
    }
  `)
  })

  it('capNesting E inherited properties', () => {
    // Create an object with inherited properties to test hasOwn check
    const proto = { inherited: 'value' }
    const obj = Object.create(proto)
    obj.own = 'ownValue'
    obj.nested = { deep: 'deepValue' }
    const result = capNesting(obj, 2) as Record<string, unknown>
    expect(result).toHaveProperty('own')
    expect(result).toHaveProperty('nested')
    // Should not have inherited property
    expect(Object.hasOwn(result, 'inherited')).toBe(false)
  })
})
