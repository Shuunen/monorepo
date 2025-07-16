import { describe, expect, it } from 'vitest'
import type { Item } from '../types/item.types'
import { mockItem } from '../utils/mock.utils'
import { calculateBasicMetrics, calculateBoxAnalysis, calculateMetrics, calculateStatusCounts, formatCurrency, formatPercentage, getItemsNotPrinted, getItemsWithoutLocation, getItemsWithoutPrice, getToGiveItemsCount, getTopValueItems } from './page-metrics.utils'

const mockItems: Item[] = [
  mockItem({
    $id: '1',
    box: 'A (apple)',
    brand: 'Apple',
    details: 'iPhone 12',
    isPrinted: true,
    name: 'iPhone 12',
    price: 500,
    reference: 'IP12',
    status: 'bought',
  }),
  mockItem({
    $id: '2',
    box: 'B (usb & audio)',
    brand: 'Sony',
    details: 'Wireless headphones',
    isPrinted: false,
    name: 'WH-1000XM4',
    price: 300,
    reference: 'WH1000XM4',
    status: 'for-sell',
  }),
  mockItem({
    $id: '3',
    box: 'A (apple)',
    brand: 'Apple',
    details: 'iPad Pro',
    isPrinted: true,
    name: 'iPad Pro',
    price: 0, // No price
    reference: 'IPADPRO',
    status: 'bought',
  }),
  mockItem({
    $id: '4',
    box: '',
    brand: '',
    details: 'Old cable',
    isPrinted: false,
    name: 'USB Cable',
    price: -1, // Invalid price
    reference: 'USBCABLE',
    status: 'lost',
  }),
]

describe('page-metrics.utils', () => {
  it('calculateBasicMetrics A should calculate correct basic metrics', () => {
    const result = calculateBasicMetrics(mockItems)

    expect(result).toMatchInlineSnapshot(`
      {
        "totalItems": 4,
        "totalValue": 800,
      }
    `)
  })

  it('calculateStatusCounts A should count items by status correctly', () => {
    const result = calculateStatusCounts(mockItems)

    expect(result).toMatchInlineSnapshot(`
      {
        "bought": 2,
        "for-sell": 1,
        "lost": 1,
      }
    `)
  })

  it('calculateBoxAnalysis A should analyze box distribution correctly', () => {
    const result = calculateBoxAnalysis(mockItems)

    expect(result).toMatchInlineSnapshot(`
      {
        "A (apple)": {
          "count": 2,
          "totalValue": 500,
        },
        "B (usb & audio)": {
          "count": 1,
          "totalValue": 300,
        },
        "Unknown": {
          "count": 1,
          "totalValue": 0,
        },
      }
    `)
  })

  it('getTopValueItems A should return top valued items', () => {
    const result = getTopValueItems(mockItems)

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "$createdAt": "2025-07-16T13:42:26.000Z",
          "$id": "1",
          "barcode": "barcode B",
          "box": "A (apple)",
          "brand": "Apple",
          "details": "iPhone 12",
          "drawer": 2,
          "isPrinted": true,
          "name": "iPhone 12",
          "photos": [
            "some-uuid",
            "https://some.url/to/image.jpg",
          ],
          "price": 500,
          "reference": "IP12",
          "status": "bought",
        },
        {
          "$createdAt": "2025-07-16T13:42:26.000Z",
          "$id": "2",
          "barcode": "barcode B",
          "box": "B (usb & audio)",
          "brand": "Sony",
          "details": "Wireless headphones",
          "drawer": 2,
          "isPrinted": false,
          "name": "WH-1000XM4",
          "photos": [
            "some-uuid",
            "https://some.url/to/image.jpg",
          ],
          "price": 300,
          "reference": "WH1000XM4",
          "status": "for-sell",
        },
      ]
    `)
  })

  it('calculateMetrics A should return complete metrics object', () => {
    const result = calculateMetrics(mockItems)

    expect(result.totalItems).toMatchInlineSnapshot(`4`)
    expect(result.totalValue).toMatchInlineSnapshot(`800`)
    expect(result.topValueItems).toHaveLength(2)
    expect(Object.keys(result.boxAnalysis)).toHaveLength(3)
    expect(Object.keys(result.statusCounts)).toHaveLength(3)
  })

  it('formatCurrency A should format currency correctly', () => {
    expect(formatCurrency(100)).toMatchInlineSnapshot(`"100 €"`)
    expect(formatCurrency(99.99)).toMatchInlineSnapshot(`"100 €"`)
    expect(formatCurrency(0)).toMatchInlineSnapshot(`"0 €"`)
  })

  it('formatPercentage A should format percentage correctly', () => {
    expect(formatPercentage(50, 100)).toMatchInlineSnapshot(`"50.0 %"`)
    expect(formatPercentage(1, 3)).toMatchInlineSnapshot(`"33.3 %"`)
    expect(formatPercentage(0, 0)).toMatchInlineSnapshot(`"0.0 %"`)
    expect(formatPercentage(0, 100)).toMatchInlineSnapshot(`"0.0 %"`)
  })

  it('calculateBasicMetrics B should handle empty array', () => {
    const result = calculateBasicMetrics([])

    expect(result).toMatchInlineSnapshot(`
      {
        "totalItems": 0,
        "totalValue": 0,
      }
    `)
  })

  it('calculateStatusCounts B should handle empty array', () => {
    const result = calculateStatusCounts([])

    expect(result).toMatchInlineSnapshot(`{}`)
  })

  it('getTopValueItems B should handle items without prices', () => {
    const itemsWithoutPrices: Item[] = [
      mockItem({
        $id: '1',
        name: 'Item 1',
        price: 0,
        reference: 'REF1',
        status: 'bought',
      }),
    ]

    const result = getTopValueItems(itemsWithoutPrices)

    expect(result).toMatchInlineSnapshot(`[]`)
  })

  it('getToGiveItemsCount A should return 0 when no items have to-give status', () => {
    const result = getToGiveItemsCount(mockItems)
    expect(result).toMatchInlineSnapshot(`0`)
  })

  it('getToGiveItemsCount B should count items with to-give status', () => {
    const itemsWithToGive = [
      mockItem({
        $id: '1',
        name: 'Item to give 1',
        reference: 'GIVE1',
        status: 'to-give',
      }),
      mockItem({
        $id: '2',
        name: 'Item to give 2',
        reference: 'GIVE2',
        status: 'to-give',
      }),
      mockItem({
        $id: '3',
        name: 'Item not to give',
        reference: 'NOGIVE',
        status: 'bought',
      }),
    ]

    const result = getToGiveItemsCount(itemsWithToGive)

    expect(result).toMatchInlineSnapshot(`2`)
  })

  it('getItemsNotPrinted A should return items that are not printed', () => {
    const result = getItemsNotPrinted(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "2",
        "4",
      ]
    `)
  })

  it('getItemsWithoutLocation A should return items without box location', () => {
    const result = getItemsWithoutLocation(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "4",
      ]
    `)
  })

  it('getItemsWithoutPrice A should return items without valid price', () => {
    const result = getItemsWithoutPrice(mockItems)

    expect(result.map(item => item.$id)).toMatchInlineSnapshot(`
      [
        "3",
        "4",
      ]
    `)
  })

  it('calculateMetrics B should include new list properties', () => {
    const result = calculateMetrics(mockItems)

    expect(result.itemsNotPrinted).toHaveLength(2)
    expect(result.itemsWithoutLocation).toHaveLength(1)
    expect(result.itemsWithoutPrice).toHaveLength(2)
    expect(result.itemsNotPrinted[0].$id).toMatchInlineSnapshot(`"2"`)
    expect(result.itemsWithoutLocation[0].$id).toMatchInlineSnapshot(`"4"`)
    expect(result.itemsWithoutPrice[0].$id).toMatchInlineSnapshot(`"3"`)
  })
})
