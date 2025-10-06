// oxlint-disable max-lines, max-nested-callbacks
import { createServer, request as httpRequest, type IncomingMessage, type ServerResponse } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { PassThrough } from 'node:stream'

export const options = {
  codes: {
    badRequest: 400,
    notFound: 404,
    ok: 200,
  },
  dateTimeSlice: 19,
  hueMax: 20_000,
  port: 3000,
  severityPadding: 7,
} as const

export function log(severity: 'info' | 'warn' | 'error', context: string, ...args: unknown[]) {
  // if in unit test, do not log
  if (process.env.VITEST) return
  const paddedSeverity = `[${severity}]`.padStart(options.severityPadding)
  // biome-ignore lint/suspicious/noConsole: allowed in this context
  console.log(`${datetime()} ${paddedSeverity} [${context}]`, ...args) // oxlint-disable-line no-console
}

export function datetime() {
  return new Date().toISOString().replace('T', ' ').slice(0, options.dateTimeSlice)
}

export function getHueColor(percent: number): number {
  return Math.round((percent * options.hueMax) / MAX_PROGRESS)
}

export function getHueColorBody(percent: number) {
  const isEverythingDone = percent === MAX_PROGRESS
  return JSON.stringify({
    bri: 255,
    hue: getHueColor(percent),
    on: !isEverythingDone,
    sat: 255,
  })
}

export function jsonResponse({ ok, message, progress, response, data, remaining, nextTask }: { ok: boolean; message: string; progress: number; response: unknown; data: unknown; remaining: unknown; nextTask: unknown }) {
  return JSON.stringify({
    data,
    datetime: datetime(),
    message,
    nextTask,
    ok,
    progress,
    remaining,
    response,
  })
}

export function sendCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// oxlint-disable-next-line max-lines-per-function
export function makeRequest({ url, method, payload, isHttps }: { url: string; method: string; payload: string; isHttps: boolean }): Promise<{ result: unknown; error: string | undefined }> {
  return new Promise(resolve => {
    const reqFn = isHttps ? httpsRequest : httpRequest
    const req = reqFn(url, {
      headers: {
        'Content-Length': Buffer.byteLength(payload),
        'Content-Type': 'application/json',
      },
      method,
      rejectUnauthorized: false,
    })
    const data = ''
    req.on(
      'response',
      flattenResponse(resolve, () => data),
    )
    req.on('error', err => resolve({ error: err.message, result: undefined }))
    req.write(payload)
    req.end()
  })
}

export function flattenResponse(resolve: (value: { result: unknown; error: string | undefined }) => void, getData: () => string) {
  return (res: IncomingMessage | PassThrough) => {
    res.on('data', (chunk: Buffer) => {
      let current = getData()
      current += chunk.toString()
      getData = () => current
    })
    res.once('end', () => {
      let result: unknown = ''
      try {
        result = JSON.parse(getData())
      } catch {
        result = getData()
      }
      resolve({ error: undefined, result })
    })
  }
}

export const MAX_PROGRESS = 100

// oxlint-disable-next-line max-lines-per-function
export const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const context = 'createServer'
  sendCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    log('info', context, 'OPTIONS request received, sending CORS headers')
    res.writeHead(options.codes.ok)
    res.end()
    return
  }
  if (req.method === 'POST' && req.url === '/set-progress') {
    log('info', context, 'POST /set-progress request received')
    handlePostSetProgress(req, res)
    return
  }
  if (req.method === 'GET' && req.url === '/hello') {
    log('info', context, 'GET /hello request received')
    res.writeHead(options.codes.ok, { 'Content-Type': 'text/plain' })
    res.end(`HelloOoOOoo ! It is ${datetime()} :D`)
    return
  }
  log('warn', context, `Unknown route method "${req.method}" with url "${req.url}"`)
  respondNotFound(res)
})

export function handlePostSetProgress(req: IncomingMessage, res: ServerResponse) {
  const context = 'handlePostSetProgress'
  log('info', context, `Received POST request for ${req.url}`)
  collectRequestBody(req)
    .then(body => {
      log('info', context, 'Request body collected for /set-progress')
      return handleSetProgressRequest({ body, res })
    })
    .catch(error => {
      log('error', context, `Error collecting request body: ${error?.message ?? error}`)
      respondBadRequest({
        message: 'Failed to read request body',
        nextTask: undefined,
        progress: 0,
        remaining: undefined,
        res,
      })
    })
}

export function collectRequestBody(req: IncomingMessage | PassThrough): Promise<string> {
  const context = 'collectRequestBody'
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
      log('info', context, `Received data chunk for request body: ${chunk.length} bytes`)
    })
    req.once('end', () => {
      log('info', context, `Request body fully received: ${body.length} bytes`)
      resolve(body)
    })
    req.on('error', error => {
      log('error', context, `Error receiving request body: ${error?.message ?? error}`)
      reject(error)
    })
  })
}

export function respondNotFound(res: ServerResponse) {
  const context = 'respondNotFound'
  log('warn', context, 'Responding with 404 Not Found')
  res.writeHead(options.codes.notFound, { 'Content-Type': 'application/json' })
  res.end(
    jsonResponse({
      data: undefined,
      message: 'Not Found',
      nextTask: undefined,
      ok: false,
      progress: 0,
      remaining: undefined,
      response: undefined,
    }),
  )
}

export function respondBadRequest({ res, message, progress, nextTask, remaining }: { res: ServerResponse; message: string; progress: number; nextTask: unknown; remaining: unknown }) {
  const context = 'respondBadRequest'
  log('warn', context, `Bad request, message : ${message}`)
  log('warn', context, 'Responding with 400 Bad Request')
  res.writeHead(options.codes.badRequest, { 'Content-Type': 'application/json' })
  res.end(
    jsonResponse({
      data: undefined,
      message,
      nextTask,
      ok: false,
      progress,
      remaining,
      response: undefined,
    }),
  )
}

// oxlint-disable-next-line max-lines-per-function
export async function handleSetProgressRequest({ body, res }: { body: string; res: ServerResponse }) {
  const context = 'handleSetProgressRequest'
  log('info', context, 'Handling set-progress request')
  const { progress, nextTask, remaining, error } = parseProgressBody(body)
  log('info', context, `Parsed progress body: progress=${progress}, nextTask=${nextTask}, remaining=${remaining}, error=${error}`)
  if (error) {
    log('warn', context, `Progress body error: ${error}`)
    respondBadRequest({
      message: error,
      nextTask,
      progress,
      remaining,
      res,
    })
    return
  }
  const hueEndpoint = process.env.HUE_ENDPOINT ?? ''
  if (!hueEndpoint) {
    log('error', context, 'HUE_ENDPOINT not set in env variables')
    respondBadRequest({
      message: 'HUE_ENDPOINT not set in env variables',
      nextTask,
      progress,
      remaining,
      res,
    })
    return
  }
  const trmnlEndpoint = process.env.TRMNL_ENDPOINT ?? ''
  if (!trmnlEndpoint) {
    log('error', context, 'TRMNL_ENDPOINT not set in env variables')
    respondBadRequest({
      message: 'TRMNL_ENDPOINT not set in env variables',
      nextTask,
      progress,
      remaining,
      res,
    })
    return
  }
  const hueBody = getHueColorBody(progress)
  log('info', context, `Prepared hue body: ${hueBody}`)
  const trmnlPayload = JSON.stringify({
    mergeVariables: {
      nextTitle: nextTask,
      progress,
      remaining: remaining ? `${remaining} min to take care` : undefined,
    },
  })
  log('info', context, `Prepared trmnl payload: ${trmnlPayload}`)
  const hueIsHttps = hueEndpoint.startsWith('https')
  const trmnlIsHttps = trmnlEndpoint.startsWith('https')
  log('info', context, `Making requests: hueIsHttps=${hueIsHttps}, trmnlIsHttps=${trmnlIsHttps}`)
  const [hueResult, trmnlResult] = await Promise.all([makeRequest({ isHttps: hueIsHttps, method: 'PUT', payload: hueBody, url: hueEndpoint }), makeRequest({ isHttps: trmnlIsHttps, method: 'POST', payload: trmnlPayload, url: trmnlEndpoint })])
  log('info', context, `Hue result: error=${hueResult.error}, result=${JSON.stringify(hueResult.result)}`)
  log('info', context, `Trmnl result: error=${trmnlResult.error}, result=${JSON.stringify(trmnlResult.result)}`)
  const ok = !hueResult.error && !trmnlResult.error
  log(ok ? 'info' : 'error', context, `Responding to /set-progress: ok=${ok}`)
  res.writeHead(options.codes.ok, { 'Content-Type': 'application/json' })
  res.end(
    jsonResponse({
      data: JSON.parse(hueBody),
      message: ok ? 'Emitted hue and trmnl color successfully' : `Error: ${hueResult.error ?? ''} ${trmnlResult.error ?? ''}`,
      nextTask,
      ok,
      progress,
      remaining,
      response: {
        hue: hueResult.error ?? hueResult.result,
        trmnl: trmnlResult.error ?? trmnlResult.result,
      },
    }),
  )
}

// oxlint-disable-next-line max-lines-per-function
export function parseProgressBody(body: string) {
  let progress = 0
  let remaining: unknown = undefined
  let nextTask: unknown = undefined
  let error: string | undefined = undefined
  const context = 'parseProgressBody'
  try {
    const parsed = JSON.parse(body)
    log('info', context, `Parsing progress body: ${body}`)
    progress = Number.parseInt(parsed.progress ?? '0', 10)
    remaining = parsed.remaining ?? undefined
    nextTask = parsed.nextTask ?? undefined
    if (!Number.isInteger(progress) || progress < 0 || progress > MAX_PROGRESS) {
      error = 'Invalid progress value. It must be an integer between 0 and 100.'
      log('warn', context, `Progress value invalid: ${progress}`)
    }
  } catch (error) {
    log('error', context, `Error parsing progress body: ${error instanceof Error ? error.message : error}`)
  }
  return { error, nextTask, progress, remaining }
}

if (globalThis.window === undefined)
  server.listen(options.port, () => {
    log('info', 'listen', `Server running at http://localhost:${options.port}`)
    log('info', 'listen', `Exposing  GET http://localhost:${options.port}/hello`)
    log('info', 'listen', `Exposing POST http://localhost:${options.port}/set-progress`)
  })
