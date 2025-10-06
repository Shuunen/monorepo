import { type ChildProcess, spawn } from 'node:child_process'
import http from 'node:http'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  return spawn(process.execPath, ['--experimental-strip-types', serverPath], { stdio: 'ignore' })
}

function stopServer(proc: ChildProcess | undefined) {
  if (proc) proc.kill()
}

function request(path: string, method = 'GET') {
  return new Promise<{ status?: number; body: string }>(resolve => {
    const req = http.request({ hostname: 'localhost', method, path, port: 3000 }, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => resolve({ body: data, status: res.statusCode }))
    })
    req.on('error', () => resolve({ body: '', status: 0 }))
    req.end()
  })
}

describe('server.cli.ts (integration)', () => {
  let proc: ChildProcess | undefined = undefined
  beforeEach(() => {
    proc = startServer()
  })
  afterEach(() => {
    stopServer(proc)
  })

  it('A should respond to GET /hello', async () => {
    await new Promise(r => setTimeout(r, 300))
    const res = await request('/hello')
    expect(res.status).toBe(200)
    expect(res.body).toMatch(/HelloOoOOoo ! It is .+ :D/)
  })

  it('B should respond 404 to unknown route', async () => {
    await new Promise(r => setTimeout(r, 300))
    const res = await request('/unknown')
    expect(res.status).toBe(404)
    const body = JSON.parse(res.body)
    expect(body.message).toBe('Not Found')
    expect(body.ok).toBe(false)
    expect(body.progress).toBe(0)
  })

  it('C should respond 404 to POST /progress with invalid body', async () => {
    await new Promise(r => setTimeout(r, 300))
    const res = await request('/progress', 'POST')
    expect(res.status).toBe(404)
    const body = JSON.parse(res.body)
    expect(body.message).toBe('Not Found')
    expect(body.ok).toBe(false)
    expect(body.progress).toBe(0)
  })

  it('D should respond 200 to POST /progress with valid body', async () => {
    await new Promise(r => setTimeout(r, 300))
    const req = http.request({ headers: { 'Content-Type': 'application/json' }, hostname: 'localhost', method: 'POST', path: '/progress', port: 3000 }, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        const body = JSON.parse(data)
        expect(body.message).toBe('Progress updated')
        expect(body.ok).toBe(true)
        expect(body.progress).toBe(50)
      })
    })
    req.write(JSON.stringify({ progress: 50 }))
    req.end()
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
    expect(serverModule.parseProgressBody(JSON.stringify({ progress: 50 }))).toMatchObject({ error: undefined, progress: 50 })
  })
  it('parseProgressBody B should handle invalid JSON', () => {
    expect(serverModule.parseProgressBody('notjson')).toMatchObject({ error: undefined })
  })
  it('parseProgressBody C should handle out of bounds', () => {
    expect(serverModule.parseProgressBody(JSON.stringify({ progress: 101 }))).toMatchObject({ error: expect.any(String) })
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
