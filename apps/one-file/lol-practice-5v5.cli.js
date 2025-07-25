/* c8 ignore start */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { request as _request } from 'node:https'
import path from 'node:path'
import { nbFourth, nbThird } from '@shuunen/shuutils'

const data = {
  customGameLobby: {
    configuration: { gameMode: 'PRACTICETOOL', gameMutator: '', gameServerRegion: '', mapId: 11, mutators: { id: 1 }, spectatorPolicy: 'AllAllowed', teamSize: 5 },
    // oxlint-disable-next-line no-magic-numbers
    lobbyName: `5v5 Practice ${String(Date.now()).slice(-4)}`,
    lobbyPassword: undefined,
  },
  isCustom: true,
}
// biome-ignore lint/style/useNamingConvention: it's ok buddy
const options = { headers: { Authorization: '', 'Content-Type': 'application/json' }, hostname: '127.0.0.1', method: 'POST', path: '/lol-lobby/v2/lobby', port: 0 }
const currentFolder = import.meta.dirname
const logFile = path.join(currentFolder, 'lol-practice-5v5.log')
let logCount = 0
/**
 *
 */
function logClear() {
  writeFileSync(logFile, '')
}
/**
 *
 * @param {...any} stuff the things to log
 */
function logAdd(/** @type {string[]} */ ...stuff) {
  logCount += 1
  appendFileSync(logFile, `\n${logCount}) ${stuff.join(' ')}\n`)
}

/**
 *
 */
// oxlint-disable-next-line max-lines-per-function
function doRequest() {
  if (!options.port) throw new Error('cannot make the request without port')
  logAdd('Making request...')
  const request = _request(options, response => {
    logAdd(`Game api response status code : ${response.statusCode?.toString() ?? 'unknown-response-statusCode'}`)
    let requestData = ''
    // oxlint-disable-next-line max-nested-callbacks
    response.on('data', chunk => {
      requestData += chunk
    })
    // oxlint-disable-next-line max-nested-callbacks
    response.on('end', () => {
      logAdd(`5v5 Practice created successfully by ${JSON.parse(requestData).localMember.summonerName}`)
    })
  })
  logAdd('Request made successfully, listening for error...')
  request.on('error', (/** @type {string} */ error) => {
    logAdd(error)
    throw new Error(`Request error : ${error}`)
  })
  logAdd('Request error listened successfully, writing data...')
  request.write(JSON.stringify(data))
  logAdd('Data written successfully, sending request...')
  request.end()
}

/**
 *
 */
function readLock() {
  const lockPath = process.argv[nbThird]
  if (lockPath === undefined) throw new Error('missing lockfile path, use me like : \n\n lol-practice-5v5.js "D:\\Games\\Riot Games\\League of Legends\\lockfile" "My game lobby name"')
  logAdd(`Summoner lockfile located at : ${lockPath}`)
  if (!lockPath.includes('lockfile')) throw new Error(String.raw`lockfile path invalid, should looks like "D:\Games\Riot Games\League of Legends\lockfile"`)
  logAdd('Reading lockfile...')
  const content = readFileSync(lockPath, 'utf8').split(':')
  logAdd('Lockfile read successfully')
  if (content[nbThird] === undefined || content[nbFourth] === undefined) throw new Error('lockfile does not contains expected data or is not formatted as usual')
  logAdd('Lockfile data parsed successfully')
  options.port = Number.parseInt(content[nbThird], 10)
  logAdd(`Game api port : ${options.port}`)
  const auth = Buffer.from(`riot:${content[nbFourth]}`).toString('base64')
  logAdd('Authorization header generated successfully')
  options.headers.Authorization = `Basic ${auth}`
}

/**
 *
 */
function handleCustomName() {
  const customName = process.argv[nbFourth]
  if (customName !== undefined) data.customGameLobby.lobbyName = customName
}

/**
 *
 */
function init() {
  logClear()
  logAdd('LoL Practice 5v5 maker starts @', String(new Date()))
  logAdd('Checking process.env.NODE_TLS_REJECT_UNAUTHORIZED status', process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ? 'OK, disabled as expected' : 'KO, not disabled, this script should not work without it')
  readLock()
  handleCustomName()
  doRequest()
}

init()
