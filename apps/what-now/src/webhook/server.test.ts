import { type ChildProcess, spawn } from 'node:child_process'
import type http from 'node:http'
import { PassThrough } from 'node:stream'
import { alignForSnap, Result } from '@monorepo/utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as serverModule from './server.cli'

// Suppress unhandled errors to prevent Vitest from reporting them globally
process.on('uncaughtException', err => {
  if (err) void err
})
process.on('unhandledRejection', err => {
  if (err) void err
})

const serverPath = require.resolve('./server.cli.ts')

function startServer() {
  // node --experimental-transform-types apps/what-now/src/webhook/server.cli.ts
  return spawn(process.execPath, ['--experimental-transform-types', serverPath], { stdio: 'ignore' })
}

function stopServer(proc: ChildProcess | undefined) {
  if (proc) proc.kill()
}

async function request(path: string, method: 'GET' | 'POST' = 'GET', body?: RequestInit['body'], headers?: RequestInit['headers']) {
  const url = `http://localhost:3000${path}`
  const options = { body, headers, method } satisfies RequestInit
  try {
    const res = await fetch(url, options)
    const text = await (method === 'GET' ? res.text() : res.json())
    return Result.ok({ response: text, status: res.status })
  } catch (error) {
    return Result.error(error instanceof Error ? error.message : error)
  }
}

describe('server.cli.ts (integration)', () => {
  let proc: ChildProcess | undefined = undefined
  async function waitForServerReady(timeout = 2000, start = Date.now()) {
    const result = await request('/hello')
    if (result.ok) return
    if (Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 100))
      return waitForServerReady(timeout, start)
    }
    throw new Error('Server startup timed out')
  }

  beforeAll(async () => {
    proc = startServer()
    await waitForServerReady()
  })
  afterAll(() => {
    stopServer(proc)
  })

  it('A should respond to GET /hello', async () => {
    const result = await request('/hello')
    if (!result.ok) throw new Error(`Request A failed : ${result.error}`)
    const { status, response } = result.value
    expect(status).toBe(200)
    expect(alignForSnap(response)).toMatchInlineSnapshot(`"HelloOoOOoo ! It is xxxx-xx-xx xx:xx:xx :D"`)
  })

  it('B should respond 404 to unknown route', async () => {
    const result = await request('/unknown')
    if (!result.ok) throw new Error(`Request B failed : ${result.error}`)
    const { status, response } = result.value
    expect(status).toBe(404)
    expect(alignForSnap(response)).toMatchInlineSnapshot(`"{"datetime":"xxxx-xx-xx xx:xx:xx","message":"Not Found","ok":false,"progress":0}"`)
  })

  it('C should respond 400 to POST /set-progress with empty body', async () => {
    const result = await request('/set-progress', 'POST', '', { 'Content-Type': 'application/x-www-form-urlencoded' })
    if (!result.ok) throw new Error(`Request C failed : ${result.error}`)
    const { status, response } = result.value
    expect(status).toBe(400)
    expect(alignForSnap(response)).toMatchInlineSnapshot(`
      "{
        "datetime": "xxxx-xx-xx xx:xx:xx",
        "message": "Invalid body : must be an object with a progress property, got \\"\\"",
        "ok": false,
        "progress": 0
      }"
    `)
  })

  it('D should respond 200 to POST /set-progress with valid body', async () => {
    const result = await request('/set-progress', 'POST', 'progress=75&remaining=30&nextTask=Review code', { 'Content-Type': 'application/x-www-form-urlencoded' })
    if (!result.ok) throw new Error(`Request D failed : ${result.error}`)
    const { status, response } = result.value
    expect(status).toBe(200)
    expect(alignForSnap(response)).toMatchInlineSnapshot(`
      "{
        "data": {
          "bri": 255,
          "hue": 15000,
          "on": true,
          "sat": 255
        },
        "datetime": "xxxx-xx-xx xx:xx:xx",
        "message": "Emitted hue and trmnl color successfully",
        "nextTask": "Review code",
        "ok": true,
        "progress": 75,
        "remaining": "30",
        "response": {
          "hue": {
            "message": "This is a fake endpoint response for testing.",
            "success": true
          },
          "trmnl": {
            "message": "This is a fake endpoint response for testing.",
            "success": true
          }
        }
      }"
    `)
  })
})

describe('server.cli.ts (unit)', () => {
  it('datetime A should return ISO string', () => {
    expect(serverModule.datetime()).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
  })

  it('getHueColor A should map percent to hue', () => {
    expect(serverModule.getHueColor(50)).toBe(Math.round((50 * serverModule.options.hueMax) / serverModule.MAX_PROGRESS))
  })

  it('getHueColorBody A should return correct JSON for 100', () => {
    expect(JSON.parse(serverModule.getHueColorBody(100))).toMatchObject({ bri: 255, hue: serverModule.options.hueMax, on: false, sat: 255 })
  })
  it('getHueColorBody B should return correct JSON for 0', () => {
    expect(JSON.parse(serverModule.getHueColorBody(0))).toMatchObject({ bri: 255, hue: 0, on: true, sat: 255 })
  })

  it('jsonResponse A should format response', () => {
    const resp = serverModule.jsonResponse({ data: 'd', message: 'msg', nextTask: 't', ok: true, progress: 1, remaining: 2, response: 'r' })
    expect(JSON.parse(resp)).toMatchObject({ data: 'd', message: 'msg', nextTask: 't', ok: true, progress: 1, remaining: 2, response: 'r' })
  })

  it('sendCorsHeaders A should set headers', () => {
    const res = { setHeader: vi.fn() } as unknown as http.ServerResponse
    serverModule.sendCorsHeaders(res)
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
  })

  it('parseProgressBody A should handle valid input', () => {
    expect(serverModule.parseProgressBody('progress=0&remaining=15&nextTask=Clean workspace')).toMatchInlineSnapshot(`
      {
        "error": undefined,
        "nextTask": "Clean workspace",
        "progress": 0,
        "remaining": "15",
      }
    `)
  })
  it('parseProgressBody B should handle invalid content', () => {
    const { error } = serverModule.parseProgressBody('not-valid')
    expect(error).toMatchInlineSnapshot(`"Invalid body : must be an object with a progress property, got "not-valid""`)
  })
  it('parseProgressBody C should handle empty body', () => {
    const { error } = serverModule.parseProgressBody('')
    expect(error).toMatchInlineSnapshot(`"Invalid body : must be an object with a progress property, got """`)
  })

  it('respondNotFound A should write 404', () => {
    const res = { end: vi.fn(), writeHead: vi.fn() } as unknown as http.ServerResponse
    serverModule.respondNotFound(res)
    expect(res.writeHead).toHaveBeenCalledWith(serverModule.options.codes.notFound, { 'Content-Type': 'application/json' })
    expect(res.end).toHaveBeenCalled()
  })

  it('respondBadRequest A should write 400', () => {
    const res = { end: vi.fn(), writeHead: vi.fn() } as unknown as http.ServerResponse
    serverModule.respondBadRequest({ message: 'bad', nextTask: undefined, progress: 0, remaining: undefined, res })
    expect(res.writeHead).toHaveBeenCalledWith(serverModule.options.codes.badRequest, { 'Content-Type': 'application/json' })
    expect(res.end).toHaveBeenCalled()
  })

  it('flattenResponse A should resolve with parsed JSON', () => {
    const mockRes = new PassThrough()
    let resolved = undefined
    const cb = serverModule.flattenResponse(
      v => {
        resolved = v
      },
      () => '',
    )
    cb(mockRes)
    mockRes.emit('data', Buffer.from('{"foo":123}'))
    mockRes.emit('end')
    expect(resolved).toMatchObject({ error: undefined, result: { foo: 123 } })
  })

  it('flattenResponse B should resolve with raw string if not JSON', () => {
    const mockRes = new PassThrough()
    let resolved = undefined
    const cb = serverModule.flattenResponse(
      v => {
        resolved = v
      },
      () => '',
    )
    cb(mockRes)
    mockRes.emit('data', Buffer.from('notjson'))
    mockRes.emit('end')
    expect(resolved).toMatchObject({ error: undefined, result: 'notjson' })
  })

  it('collectRequestBody A should resolve with body', async () => {
    const mockReq = new PassThrough()
    const prom = serverModule.collectRequestBody(mockReq)
    mockReq.emit('data', Buffer.from('abc'))
    mockReq.emit('end')
    await expect(prom).resolves.toBe('abc')
  })

  it('collectRequestBody B should reject on error', async () => {
    const mockReq = new PassThrough()
    const prom = serverModule.collectRequestBody(mockReq)
    mockReq.emit('error', new Error('fail'))
    await expect(prom).rejects.toThrow('fail')
  })
})
