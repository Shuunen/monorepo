/* v8 ignore start -- @preserve */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './pages/app.page'
import { state } from './utils/state.utils'
import { setDarkTheme } from './utils/theme.utils'

const root = createRoot(document.querySelector('#root') as HTMLElement)

setDarkTheme(state.darkTheme)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
