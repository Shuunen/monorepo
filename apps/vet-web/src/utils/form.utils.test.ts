import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormChangeDetector } from './form.utils'

const age1 = 1
const age2 = 2
const age3 = 3
const callsOnce = 1

describe(useFormChangeDetector, () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls callback with form values on change', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => {
      const form = useForm<{ name: string }>({ defaultValues: { name: '' } })
      useFormChangeDetector(form, callback)
      return form
    })
    act(() => {
      result.current.setValue('name', 'John')
    })
    act(() => {
      vi.runAllTimers()
    })
    expect(callback).toHaveBeenCalledWith({ name: 'John' })
  })

  it('debounces callback calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => {
      const form = useForm<{ age: number }>({ defaultValues: { age: 0 } })
      useFormChangeDetector(form, callback)
      return form
    })
    act(() => {
      result.current.setValue('age', age1)
      result.current.setValue('age', age2)
      result.current.setValue('age', age3)
    })
    act(() => {
      vi.runAllTimers()
    })
    expect(callback).toHaveBeenCalledTimes(callsOnce)
    expect(callback).toHaveBeenCalledWith({ age: 3 })
  })

  it('unsubscribes on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => {
      const form = useForm<{ foo: string }>({ defaultValues: { foo: '' } })
      useFormChangeDetector(form, callback)
      return form
    })
    unmount()
    act(() => {
      vi.runAllTimers()
    })
    expect(callback).not.toHaveBeenCalled()
  })
})
