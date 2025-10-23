import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockItem } from '../utils/mock.utils'
import { navigate } from '../utils/navigation.utils'
import { state } from '../utils/state.utils'
import { search } from './page-search.const'

// Mock navigation utils
vi.mock('../utils/navigation.utils', () => ({
  navigate: vi.fn(),
}))

// Mock fuse.js/basic
vi.mock('fuse.js/basic', () => {
  class MockFuse {
    items: unknown[]
    constructor(items: unknown[]) {
      this.items = items
    }
    search() {
      void this.items
      return [{ item: { $id: '1', name: 'Test Item 1' } }, { item: { $id: '2', name: 'Test Item 2' } }]
    }
  }
  return { default: MockFuse }
})

describe('page-search.const', () => {
  const mockItems = [
    mockItem({
      $id: '1',
      barcode: 'BAR123',
      reference: 'REF123',
    }),
    mockItem({
      $id: '2',
      barcode: 'BAR456',
      reference: 'REF456',
    }),
  ]

  beforeEach(() => {
    state.items = mockItems
    vi.clearAllMocks()
  })

  it('search A should return search results when no exact match found', async () => {
    const result = await search('test query')

    expect(result).toMatchInlineSnapshot(`
      {
        "header": "2 results found for “test query”",
        "results": [
          {
            "$id": "1",
            "name": "Test Item 1",
          },
          {
            "$id": "2",
            "name": "Test Item 2",
          },
        ],
      }
    `)
  })

  it('search B should route to item details when exact reference match found', async () => {
    const result = await search('REF123')

    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/item/details/1/single')
    expect(result).toMatchInlineSnapshot(`
      {
        "header": "",
        "results": [],
      }
    `)
  })

  it('search C should route to item details when exact barcode match found', async () => {
    const result = await search('BAR456')

    expect(vi.mocked(navigate)).toHaveBeenCalledWith('/item/details/2/single')
    expect(result).toMatchInlineSnapshot(`
      {
        "header": "",
        "results": [],
      }
    `)
  })
})
