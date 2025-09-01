import { createState, storage } from '@shuunen/utils'
import type { Task } from '../types'

const tasks: Task[] = []

export const { state, watchState } = createState(
  {
    apiCollection: '',
    apiDatabase: '',
    hueEndpoint: '',
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
    /** the webhook URL for the terminal */
    trmnlWebhook: '',
  },
  storage,
  /* c8 ignore next */ ['apiDatabase', 'apiCollection', 'hueEndpoint', 'tasks', 'tasksTimestamp', 'trmnlWebhook'],
)

export type CredentialField = keyof Pick<typeof state, 'apiCollection' | 'apiDatabase' | 'hueEndpoint' | 'trmnlWebhook'>
