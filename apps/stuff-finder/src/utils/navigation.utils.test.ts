import type { NavigateFunction } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { navigate, setNavigate } from './navigation.utils'

describe('navigation.utils', () => {
  let mockNavigate: NavigateFunction = vi.fn()

  beforeEach(() => {
    mockNavigate = vi.fn()
    setNavigate(undefined as unknown as NavigateFunction)
  })

  it('setNavigate A should store the navigate function', () => {
    setNavigate(mockNavigate)
    navigate('/test')
    expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: false })
  })

  it('navigate A should call navigate with path and default replace false when navigate is set', () => {
    setNavigate(mockNavigate)
    navigate('/dashboard')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: false })
  })

  it('navigate B should call navigate with path and replace true when specified', () => {
    setNavigate(mockNavigate)
    navigate('/login', true)
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('navigate C should not call navigate when navigate is not set', () => {
    navigate('/test')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigate D should handle multiple calls with different parameters', () => {
    setNavigate(mockNavigate)
    navigate('/first')
    navigate('/second', true)
    navigate('/third', false)
    expect(mockNavigate).toHaveBeenCalledTimes(3)
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/first', { replace: false })
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/second', { replace: true })
    expect(mockNavigate).toHaveBeenNthCalledWith(3, '/third', { replace: false })
  })
})
