import { alignForSnap } from './testing-align-for-snap.js'

it('cleanForSnap A Windows filepath', () => {
  const result = alignForSnap({ value: String.raw`\documents\my-file.pdf` })
  expect(result).toMatchInlineSnapshot(`
    "{
      "value": "/documents/my-file.pdf"
    }"
  `)
})

it('cleanForSnap B French date', () => {
  const result = alignForSnap('Lu et approuvé le 16/05/2024 17:36:32')
  expect(result).toMatchInlineSnapshot('"Lu et approuvé le xx/xx/xxxx xx:xx:xx"')
})

it('cleanForSnap C American date', () => {
  const result = alignForSnap('Read & approved on 6/25/2024, 11:21:23 AM')
  expect(result).toMatchInlineSnapshot('"Read & approved on xx/xx/xxxx xx:xx:xx"')
})

it('cleanForSnap D Date instance', () => {
  expect(alignForSnap(new Date('2024-05-16T17:36:32'))).toMatchInlineSnapshot('""xxxx-xx-xxTxx:xx:xx.xxxZ""')
})

it('cleanForSnap E kind of ISO date string', () => {
  expect(alignForSnap('2024-05-16 15:36:32.000Z')).toMatchInlineSnapshot('"xxxx-xx-xx xx:xx:xx.xxxZ"')
})

it('cleanForSnap F kind of ISO date string without timezone', () => {
  expect(alignForSnap('2024-05-16T15:36:32')).toMatchInlineSnapshot('"xxxx-xx-xxTxx:xx:xx"')
})
