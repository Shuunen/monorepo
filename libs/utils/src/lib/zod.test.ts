import { z } from 'zod'
import { zodMsg, zodSnap } from './zod.js'

describe('zod', () => {
  it('zodMsg A invalid email', () => {
    const schema = z.email()
    const result = schema.safeParse('not an email')
    const message = zodMsg(result.error)
    expect(message).toMatchInlineSnapshot(`"Invalid email address"`)
  })

  it('zodMsg B valid email', () => {
    const schema = z.email()
    const result = schema.safeParse('mr-clean@yopmail.fr')
    const message = zodMsg(result.error)
    expect(message).toMatchInlineSnapshot(`undefined`)
  })
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
