/** biome-ignore-all lint/style/useNamingConvention: it's ok here */
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { isBrowserEnvironment, isTestEnvironment } from './environment.js'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

describe('environment utils', () => {
  const testSamples = [
    ['A default to globalThis should detect a test environment', undefined, true],
    ['B should detect a jest test environment', { jest: true }, true],
    ['C should detect a mocha test environment', { mocha: true }, true],
    ['D should detect a vitest test environment', { __vitest_environment__: true }, true],
    ['E should detect a bun test environment', { Bun: { argv: ['script.test.js'] } }, true],
    ['F should not detect a bun test environment', { Bun: { argv: ['script.js'] } }, false],
    ['G should not detect any test environment', {}, false],
  ] as const

  for (const [letter, sample, expected] of testSamples)
    it(`isTestEnvironment ${letter}`, () => {
      expect(isTestEnvironment(sample)).toBe(expected)
    })

  const browserSamples = [
    ['A we want dev env by default to not be detected as browser', undefined, false],
    ['B by skipping the isHappyDom guard, the dev env is indeed detected as browser', 'hey', true],
    ['C headless browser should not be detected as browser', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/121.0.0.0 Safari/537.36', false],
    ['D empty userAgent should not be detected as browser', '', false],
  ] as const

  for (const [letter, sample, expected] of browserSamples)
    it(`isBrowserEnvironment ${letter}`, () => {
      expect(isBrowserEnvironment(sample)).toBe(expected)
    })
})
