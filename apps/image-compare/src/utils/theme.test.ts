import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setDarkTheme } from './theme.utils'

vi.mock('./logger.utils', () => ({
  logger: {
    info: vi.fn(),
  },
}))

describe('theme.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')
  })

  it('setDarkTheme A should enable dark theme when isDark is true', () => {
    setDarkTheme(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setDarkTheme B should disable dark theme when isDark is false', () => {
    document.documentElement.classList.add('dark')
    setDarkTheme(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setDarkTheme C should log enabling message when isDark is true', async () => {
    const { logger } = await import('./logger.utils')
    setDarkTheme(true)
    expect(logger.info).toHaveBeenCalledWith('Enabling dark theme')
  })

  it('setDarkTheme D should log disabling message when isDark is false', async () => {
    const { logger } = await import('./logger.utils')
    setDarkTheme(false)
    expect(logger.info).toHaveBeenCalledWith('Disabling dark theme')
  })
})
