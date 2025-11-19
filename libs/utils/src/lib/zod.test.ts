import { z } from 'zod'
import { zodSnap } from './zod.js'

describe('zod', () => {
  it('zodSnap A invalid email', () => {
    const schema = z.email()
    const result = schema.safeParse('not an email')
    const message = zodSnap(result.error)
    expect(message).toMatchInlineSnapshot(`
      [
        " | invalid_format | Invalid email address",
      ]
    `)
  })

  it('zodSnap B valid email', () => {
    const schema = z.email()
    const result = schema.safeParse('mr-clean@yopmail.fr')
    const message = zodSnap(result.error)
    expect(message).toMatchInlineSnapshot(`undefined`)
  })
})
