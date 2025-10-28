import { alignForSnap } from '@monorepo/utils'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormSummary } from './form-summary'

describe('form-summary', () => {
  it('FormSummary A should render simple data', () => {
    const data = {
      age: 30,
      name: 'John Doe',
    }
    const { container } = render(<FormSummary data={data} />)
    const cells = container.querySelectorAll('td')
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"data.age | 30 | data.name | John Doe"`)
  })
  it('FormSummary B should render nested data with flattened keys', () => {
    const data = {
      user: {
        address: {
          city: 'Springfield',
          street: '456 Elm St',
        },
        name: 'Jane Smith',
      },
    }
    const { container } = render(<FormSummary data={data} />)
    const cells = container.querySelectorAll('td')
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"data.user.address.city | Springfield | data.user.address.street | 456 Elm St | data.user.name | Jane Smith"`)
  })
  it('FormSummary C should use custom root path', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
    }
    const { container } = render(<FormSummary data={data} rootPath="user" />)
    const cells = container.querySelectorAll('td')
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"user.firstName | John | user.lastName | Doe"`)
  })
  it('FormSummary D should handle empty object', () => {
    const data = {}
    const { container } = render(<FormSummary data={data} />)
    const cells = container.querySelectorAll('td')
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`""`)
  })
  it('FormSummary E should convert non-string values to strings', () => {
    const data = {
      age: 30,
      isActive: true,
      score: 95.5,
    }
    const { container } = render(<FormSummary data={data} />)
    const cells = container.querySelectorAll('td')
    expect(alignForSnap(cells)).toMatchInlineSnapshot(`"data.age | 30 | data.isActive | true | data.score | 95.5"`)
  })
})
