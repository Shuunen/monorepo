import { toastError, toastInfo } from '@monorepo/utils'
import { createRoot } from 'react-dom/client'
import { App } from './app'
// oxlint-disable-next-line no-unassigned-import
import './assets/styles.css'
import { getItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { state } from './utils/state.utils'

logger.info('app start')

const root = document.querySelector('#app')
if (root) createRoot(root).render(<App />)
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
