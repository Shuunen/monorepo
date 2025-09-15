import { describe, expect, it } from 'vitest'
import { applyRules } from './converter'

describe('applyRules', () => {
  it('A should apply enabled rules in order', () => {
    expect(
      applyRules('foo. right bar.', [
        { enabled: true, pattern: '\\.', replacement: '🐱' },
        { enabled: true, pattern: 'right', replacement: '' },
      ]),
    ).toMatchInlineSnapshot('"foo🐱  bar🐱"')
  })
  it('B should skip disabled rules', () => {
    expect(
      applyRules('foo.', [
        { enabled: false, pattern: 'foo', replacement: 'bar' },
        { enabled: true, pattern: '\\.', replacement: '🐱' },
      ]),
    ).toMatchInlineSnapshot('"foo🐱"')
  })
  it('C should handle invalid regex gracefully', () => {
    expect(applyRules('foo', [{ enabled: true, pattern: '[', replacement: 'x' }])).toMatchInlineSnapshot('"foo"')
  })
})
