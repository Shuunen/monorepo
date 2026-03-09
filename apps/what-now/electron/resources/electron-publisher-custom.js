// oxlint-disable no-console, no-undef, no-require-imports, no-commonjs, prefer-module
const electronPublish = require('electron-publish')

class Publisher extends electronPublish.Publisher {
  // oxlint-disable-next-line class-methods-use-this
  upload(task) {
    console.log('electron-publisher-custom', task.file)
  }
}
module.exports = Publisher
