/**
 * Check if the environment is a test environment
 * @returns true if the environment is a test environment
 */
export function isTestEnvironment() {
  const properties = ['jest', 'mocha', '__vitest_environment__', '__vitest_required__', '__vitest_browser_runner__', '__vitest_browser__', '__vitest_worker__', '__coverage__', 'STORYBOOK_ENV', '__STORYBOOK_ADDONS_CHANNEL__']
  const hasTestBin = properties.some(property => property in globalThis)
  /* c8 ignore next 3 */
  if (hasTestBin) return true
  // @ts-expect-error globalThis.Bun is not defined in some environments
  const useBunTest = 'Bun' in globalThis && globalThis.Bun && globalThis.Bun.argv.join(' ').includes('.test.')
  return useBunTest
}

/**
 * Check if the environment is a browser environment
 * @param userAgent optional, the user agent to check, default is navigator.userAgent
 * @returns true if the environment is a browser environment
 */
export function isBrowserEnvironment(userAgent = globalThis.navigator?.userAgent) {
  /* c8 ignore next 3 */
  if (!userAgent) return false
  if (userAgent.includes('HappyDOM')) return false
  if (userAgent.includes('Headless')) return false
  return typeof document !== 'undefined' && globalThis.matchMedia !== undefined
}
