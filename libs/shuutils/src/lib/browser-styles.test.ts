import { cn } from './browser-styles.js'

it('cn A', () => {
  expect(cn('a', 'b', 'c')).toMatchInlineSnapshot(`"a b c"`)
})

it('cn B', () => {
  // @ts-expect-error testing
  // eslint-disable-next-line unicorn/no-useless-undefined, unicorn/no-null
  expect(cn('a', null, 'b', 'c', undefined)).toMatchInlineSnapshot(`"a b c"`)
})
