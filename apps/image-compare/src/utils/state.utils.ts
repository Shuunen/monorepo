import { createState, storage } from '@monorepo/utils'

storage.prefix = 'image-compare_'

export const { state } = createState(
  {
    darkTheme: true,
  },
  storage,
  ['darkTheme'],
)
