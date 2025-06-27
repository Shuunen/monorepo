import { generateMark } from './unique-mark.node.js'

describe('Unique mark', () => {
  it('should generate a mark', () => {
    const mark = generateMark({ commit: 'd52a6ba', date: '27/06/2025 20:08:01', version: '2.0.1' })
    expect(mark).toMatchInlineSnapshot(`"2.0.1 - d52a6ba - 27/06/2025 20:08:01"`)
  })
})
