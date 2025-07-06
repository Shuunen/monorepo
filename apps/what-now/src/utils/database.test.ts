import { isBrowserEnvironment } from '@shuunen/shuutils'
import { expect, it } from 'vitest'

it('should detect browser env', () => {
  expect(isBrowserEnvironment()).toMatchInlineSnapshot(`false`)
})
