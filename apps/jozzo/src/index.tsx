import Button from '@mui/material/Button'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import logo from './assets/logo-fillable.svg?react'
import { BottleGrid } from './components/bottle-grid'
// oxlint-disable-next-line no-unassigned-import
import './style.css'
import { startEffects } from './utils/effects.utils'
import { machine } from './utils/state.utils'

/**
 * The main application
 * @returns the application component
 */
function App() {
  const [state, setState] = useState<(typeof machine)['state']>('initial')
  machine.watchContext('state', () => setState(machine.state))
  // biome-ignore lint/suspicious/noConsole: remove me later ^^
  console.count('render') // oxlint-disable-line no-console
  return (
    <div className="container mx-auto flex flex-col pb-44 h-screen w-full max-w-xl align-middle items-center justify-center gap-6">
      {logo({ className: `${state === 'initial' ? 'pt-24 pb-6 w-4/5 fill-purple-900' : 'w-56 fill-transparent hidden md:block'} drop-shadow-lg transition-all`, title: 'app logo' })}
      {state === 'initial' && (
        <Button
          onClick={() => {
            machine.start()
            startEffects()
          }}
          variant="contained"
        >
          Start game
        </Button>
      )}
      {state !== 'initial' && (
        <>
          <BottleGrid state={state} />
          <Button
            color="warning"
            onClick={() => {
              machine.reset()
              startEffects()
            }}
            variant="contained"
          >
            Reset game
          </Button>
        </>
      )}
    </div>
  )
}

const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
