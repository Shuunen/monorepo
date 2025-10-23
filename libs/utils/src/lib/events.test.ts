import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { emit, off, on } from './events.js'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

it('on, emit & off', () => {
  const callback = vi.fn(() => 12)
  const listener = on('foo', callback)
  expect(callback).toHaveBeenCalledTimes(0)
  emit('foo', 42)
  emit('bar', 'wow')
  expect(callback).toHaveBeenCalledTimes(1)
  // @ts-expect-error testing purpose
  expect(callback.mock.calls[0]?.[0]).toMatchInlineSnapshot(`42`)
  off(listener)
})

it('emit without data', () => {
  const callback = vi.fn()
  const listener = on('test-event', callback)
  emit('test-event')
  expect(callback).toHaveBeenCalledTimes(1)
  off(listener)
})

it('on handles non-CustomEvent', () => {
  const callback = vi.fn()
  const element = document.createElement('div')
  const listener = on('click', callback, element)
  element.click()
  expect(callback).toHaveBeenCalledTimes(1)
  off(listener)
})
