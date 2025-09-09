import { createState, storage } from '@monorepo/utils'
import type { Task } from '../types'

const tasks: Task[] = []

export const { state, watchState } = createState(
  {
    apiCollection: '',
    apiDatabase: '',
    isLoading: false,
    /** true if the app is ready to use */
    isSetup: false,
    showErrorToast: '',
    showInfoToast: '',
    statusError: '',
    statusInfo: 'Loading, please wait...',
    statusProgress: '',
    /** the last list of tasks fetched */
    tasks,
    /** timestamp of the last time tasks were fetched, in milliseconds */
    tasksTimestamp: 0,
    /** the webhook URL to connect the app with external services */
    webhook: '',
  },
  storage,
  /* c8 ignore next */ ['apiDatabase', 'apiCollection', 'tasks', 'tasksTimestamp', 'webhook'],
)

export type CredentialField = keyof Pick<typeof state, 'apiCollection' | 'apiDatabase' | 'webhook'>
