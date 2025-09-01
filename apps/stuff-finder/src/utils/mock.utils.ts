import { nbDaysInWeek, sleep } from '@shuunen/utils'
import { vi } from 'vitest'
import type { Item, ItemModel } from '../types/item.types'
import { defaultSound } from '../types/sounds.types'
import { defaultStatus } from '../types/status.types'
import { defaultTheme } from '../types/theme.types'
import type { State } from './state.utils'

export function mockItem(data: Partial<Item> = {}) {
  return {
    $createdAt: '2025-07-16T13:42:26.000Z',
    $id: 'rec234',
    barcode: 'barcode B',
    box: 'B (usb & audio)',
    brand: 'brand B',
    details: 'details B',
    drawer: 2,
    isPrinted: false,
    name: 'name B',
    photos: ['some-uuid', 'https://some.url/to/image.jpg'],
    price: 42,
    reference: 'reference B',
    status: 'bought',
    ...data,
  } satisfies Item as Item
}

export function mockItemModel(data: Partial<ItemModel> = {}) {
  return {
    ...mockItem(),
    $collectionId: 'col234',
    $createdAt: '2020-03-01T00:00:00.000Z',
    $databaseId: 'db234',
    $permissions: [],
    $sequence: 1,
    $updatedAt: '2021-08-01T00:00:00.000Z',
    box: 'B (usb & audio)',
    drawer: 2,
    ...data,
  } satisfies ItemModel as ItemModel
}

export function mockState(data: Partial<State> = {}) {
  return {
    credentials: { bucketId: 'bucketA', collectionId: 'collectionA', databaseId: 'databaseA', wrap: 'wrapA' },
    display: 'list',
    items: [] satisfies Item[],
    itemsTimestamp: Date.now(),
    sound: defaultSound,
    status: defaultStatus,
    theme: defaultTheme,
    ...data,
  } satisfies State
}

export const mockFetch = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
  await sleep(nbDaysInWeek)
  return {
    blob: async () => {
      await sleep(nbDaysInWeek)
      return { input, options }
    },
  } as unknown as Promise<Response>
})
