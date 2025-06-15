import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { isBrowserEnvironment, isTestEnvironment } from './environment.js'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

it('isTestEnvironment A', () => {
  expect(isTestEnvironment()).toBe(true)
})

it('isBrowserEnvironment A we want dev env by default to not be detected as browser', () => {
  expect(isBrowserEnvironment()).toBe(false)
})

it('isBrowserEnvironment B by skipping the isHappyDom guard, the dev env is indeed detected as browser', () => {
  expect(isBrowserEnvironment('hey')).toBe(true)
})
