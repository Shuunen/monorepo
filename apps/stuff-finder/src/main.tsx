import { toastError, toastInfo } from '@shuunen/shuutils'
import { render } from 'preact'
import { App } from './app'
// oxlint-disable-next-line no-unassigned-import
import './assets/styles.css'
import { getItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { state } from './utils/state.utils'

logger.info('app start')

const root = document.querySelector('#app')
if (root) render(<App />, root)
else logger.error('root not found')

getItems()
  .then(result => {
    state.status = result.ok ? 'ready' : 'settings-required'
    if (result.ok) toastInfo(result.value)
    else if (typeof result.error === 'string') toastError(result.error)
  })
  .catch(error => {
    logger.showError('error while getting items', error)
  })
