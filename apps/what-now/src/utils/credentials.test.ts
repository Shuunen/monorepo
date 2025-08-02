import { expect, it } from 'vitest'
import { checkUrlCredentials, parseClipboard, validateCredentials } from './credentials.utils'
import { state } from './state.utils'

const validUuid = '12345678-90ab-cdef-ffff-ffffffffffff'
const invalidUuid = '12345678-90ab-cdef-ffff-ffffffffffff!'
const validUrl = 'https://zob.com'

it('parseClipboard A empty', () => {
  const { apiCollection, apiDatabase, hueEndpoint } = parseClipboard('')
  expect(apiCollection).toBe('')
  expect(apiDatabase).toBe('')
  expect(hueEndpoint).toBe('')
})

it('parseClipboard B invalid', () => {
  const { apiCollection, apiDatabase, hueEndpoint } = parseClipboard(`"${invalidUuid}\n${validUuid}\n${validUrl}"`)
  expect(apiCollection).toBe('')
  expect(apiDatabase).toBe('')
  expect(hueEndpoint).toBe('')
})

it('parseClipboard C valid', () => {
  const { apiCollection, apiDatabase, hueEndpoint, trmnlWebhook } = parseClipboard(`"${validUuid}\n${validUuid}\n${validUrl}\n${validUrl}"`)
  expect(apiCollection).toBe(validUuid)
  expect(apiDatabase).toBe(validUuid)
  expect(hueEndpoint).toBe(validUrl)
  expect(trmnlWebhook).toBe(validUrl)
})

it('validateCredentials A', () => {
  expect(validateCredentials('A')).toBe(false)
})

it('validateCredentials B valid credentials', () => {
  expect(validateCredentials(validUuid, validUuid)).toBe(true)
})

it('checkUrlCredentials A nothing setup', () => {
  expect(checkUrlCredentials()).toBe(false)
})

it('checkUrlCredentials B giving valid hash', () => {
  expect(checkUrlCredentials(`#${validUuid}&${validUuid}`)).toBe(true)
})

it('checkUrlCredentials C giving invalid hash', () => {
  state.apiDatabase = ''
  state.apiCollection = ''
  const hasSucceed = checkUrlCredentials(`#${invalidUuid}&${validUuid}`)
  expect(hasSucceed).toBe(false)
})

it('checkUrlCredentials D with a with valid base & token in state', () => {
  state.apiDatabase = validUuid
  state.apiCollection = validUuid
  const hasSucceed = checkUrlCredentials()
  expect(hasSucceed).toBe(true)
})
