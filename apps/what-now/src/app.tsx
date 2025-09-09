// oxlint-disable no-unassigned-import
import { debounce, nbHueMax, on, storage, toastError } from '@monorepo/utils'
import { checkUrlCredentials } from './utils/credentials.utils'
import './utils/database.utils'
import './utils/idle.utils'
import { Route, Routes } from 'react-router-dom'
import { PageAbout } from './pages/page-about'
import { PagePlanner } from './pages/page-planner'
import { PageSettings } from './pages/page-settings'
import { PageTasks } from './pages/page-tasks'
import { logger } from './utils/logger.utils'
import { state, watchState } from './utils/state.utils'
import { loadTasks } from './utils/tasks.utils'

const prefix = 'what-now_'

function setup() {
  if (storage.prefix === prefix) return
  logger.info('app setup')
  storage.prefix = prefix
  const loadTasksDebounced = debounce(loadTasks, nbHueMax)
  on('user-activity', () => loadTasksDebounced('user-activity'))
  watchState('showErrorToast', () => toastError(state.showErrorToast))
  on('error', (error: Readonly<Error>) => toastError(`global error catch : ${error.message}`))
  watchState('isSetup', () => loadTasksDebounced('is-setup'))
  checkUrlCredentials(document.location.hash)
}

export function App() {
  setup()
  logger.info('app render')
  return (
    <Routes>
      <Route element={<PageTasks />} path="/" />
      <Route element={<PagePlanner />} path="/planner" />
      <Route element={<PageSettings />} path="/settings" />
      <Route element={<PageAbout />} path="/about" />
    </Routes>
  )
}
