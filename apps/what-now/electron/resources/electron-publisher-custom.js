// oxlint-disable no-console, no-empty-function, no-undef, no-require-imports, no-commonjs
/** biome-ignore-all lint/suspicious/noConsole: it's ok */
const electronPublish = require('electron-publish')

class Publisher extends electronPublish.Publisher {
  upload(task) {
    console.log('electron-publisher-custom', task.file)
  }
}
module.exports = Publisher
