import { on, toastError } from '@shuunen/shuutils'
import { state, watchState } from '../utils/state.utils'

watchState('showErrorToast', () => {
  void toastError(state.showErrorToast)
})

on('error', (error: Readonly<Error>) => {
  void toastError(`global error catch : ${error.message}`)
})
