// oxlint-disable no-console, no-undef, no-require-imports, no-commonjs
/** biome-ignore-all lint/suspicious/noConsole: it's ok */
const electronPublish = require('electron-publish')

class Publisher extends electronPublish.Publisher {
  // oxlint-disable-next-line class-methods-use-this
  upload(task) {
    console.log('electron-publisher-custom', task.file)
  }
}
module.exports = Publisher
