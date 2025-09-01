import { expect, it, vi } from 'vitest'
import { fetchJson } from './fetch.js'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

it('fetchJson A should successfully fetch and parse JSON data', async () => {
  const mockData = { id: 123, message: 'success' }
  const mockResponse = {
    json: vi.fn().mockResolvedValue(mockData),
  }
  mockFetch.mockResolvedValue(mockResponse)

  const result = await fetchJson('https://api.example.com/data', { method: 'GET' })

  expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', { method: 'GET' })
  expect(mockResponse.json).toHaveBeenCalled()
  expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": {
        "id": 123,
        "message": "success",
      },
    }
  `)
})

it('fetchJson B should handle fetch network errors', async () => {
  const networkError = new Error('Network error')
  mockFetch.mockRejectedValue(networkError)

  const result = await fetchJson('https://api.example.com/error', { method: 'GET' })

  expect(result).toMatchInlineSnapshot(`
    Err {
      "error": "fetch failed : Error: Network error",
      "ok": false,
    }
  `)
})

it('fetchJson C should handle JSON parsing errors', async () => {
  const mockResponse = {
    json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
  }
  mockFetch.mockResolvedValue(mockResponse)

  const result = await fetchJson('https://api.example.com/invalid', { method: 'POST' })

  expect(result).toMatchInlineSnapshot(`
    Err {
      "error": "Error: Invalid JSON",
      "ok": false,
    }
  `)
})

it('fetchJson D should pass request options correctly', async () => {
  const mockData = { status: 'ok' }
  const mockResponse = {
    json: vi.fn().mockResolvedValue(mockData),
  }
  mockFetch.mockResolvedValue(mockResponse)

  const options = {
    body: JSON.stringify({ test: 'data' }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }

  const result = await fetchJson('https://api.example.com/post', options)

  expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/post', options)
  expect(result.ok).toBe(true)
  if (result.ok) expect(result.value).toEqual(mockData)
})

it('fetchJson E should handle empty response body', async () => {
  const mockResponse = {
    json: vi.fn().mockResolvedValue(null),
  }
  mockFetch.mockResolvedValue(mockResponse)

  const result = await fetchJson('https://api.example.com/empty', { method: 'GET' })

  expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": null,
    }
  `)
})
