// oxlint-disable no-process-exit, max-lines-per-function, max-nested-callbacks, no-null, no-require-imports, no-undef, no-commonjs
/** biome-ignore-all lint/correctness/noNodejsModules: we can use node here */
const cp = require('node:child_process')
const chokidar = require('chokidar')
const electron = require('electron')

let child = null
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const reloadWatcher = {
  debouncer: null,
  ready: false,
  restarting: false,
  watcher: null,
}

///*
function runBuild() {
  return new Promise((resolve, _reject) => {
    const tempChild = cp.spawn(npmCmd, ['run', 'build'])
    tempChild.once('exit', () => {
      resolve()
    })
    tempChild.stdout.pipe(process.stdout)
  })
}
//*/

async function spawnElectron() {
  if (child !== null) {
    child.stdin.pause()
    child.kill()
    child = null
    await runBuild()
  }
  child = cp.spawn(electron, ['--inspect=5858', './'])
  child.on('exit', () => {
    if (!reloadWatcher.restarting) process.exit(0)
  })
  child.stdout.pipe(process.stdout)
}

function setupReloadWatcher() {
  reloadWatcher.watcher = chokidar
    .watch('./src/**/*', {
      // biome-ignore lint/performance/useTopLevelRegex: fix me later
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
      reloadWatcher.ready = true
    })
    .on('all', (_event, _path) => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer)
        reloadWatcher.debouncer = setTimeout(async () => {
          reloadWatcher.restarting = true
          await spawnElectron()
          reloadWatcher.restarting = false
          reloadWatcher.ready = false
          clearTimeout(reloadWatcher.debouncer)
          reloadWatcher.debouncer = null
          reloadWatcher.watcher = null
          setupReloadWatcher()
          // oxlint-disable-next-line no-magic-numbers
        }, 500)
      }
    })
}
// biome-ignore lint/nursery/noFloatingPromises: it's ok here
;(async () => {
  await runBuild()
  await spawnElectron()
  setupReloadWatcher()
})()
