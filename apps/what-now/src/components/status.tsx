import { div, text, tw } from '@shuunen/shuutils'
import { state, watchState } from '../utils/state.utils'

const error = text(tw('app-error font-bold text-red-500'), state.statusError)
watchState('statusError', () => {
  error.innerHTML = state.statusError
})

const info = text('info text-transparent transition-colors ease-in-out', state.statusInfo)
watchState('statusInfo', () => {
  info.innerHTML = state.statusInfo || '&nbsp;'
  info.classList.toggle(tw('text-inherit'), state.statusInfo !== '')
})

const progress = text(tw('app-progress text-2xl font-light italic'), state.statusProgress)
watchState('statusProgress', () => {
  progress.innerHTML = state.statusProgress
})

const status = div(tw('app-status flex flex-col'))

status.append(error, info, progress)

export { status }
