/**
 * Check if the environment is a test environment
 * @param glob optional, the global object to check, default is globalThis
 * @returns true if the environment is a test environment
 */
export function isTestEnvironment(glob = globalThis) {
  const properties = ['jest', 'mocha', 'playwright', '__vitest_environment__', '__vitest_required__', '__vitest_browser_runner__', '__vitest_browser__', '__vitest_worker__', '__coverage__', 'STORYBOOK_ENV', '__STORYBOOK_ADDONS_CHANNEL__']
  const hasTestProp = properties.some(property => property in glob)
  if (hasTestProp) return true
  // @ts-expect-error type issue
  const useBunTest = 'Bun' in glob && glob?.Bun?.argv.join(' ').includes('.test.')
  return useBunTest
}

/**
 * Check if the environment is a browser environment
 * @param userAgent optional, the user agent to check, default is navigator.userAgent
 * @returns true if the environment is a browser environment
 */
export function isBrowserEnvironment(userAgent = globalThis.navigator?.userAgent) {
  if (!userAgent) return false
  if (userAgent.includes('HappyDOM')) return false
  if (userAgent.includes('Headless')) return false
  return typeof document !== 'undefined' && globalThis.matchMedia !== undefined
}
