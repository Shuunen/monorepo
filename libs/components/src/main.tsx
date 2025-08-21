/* c8 ignore start */
import { createRoot } from 'react-dom/client'
import { KitchenSink } from './molecules/kitchen-sink'

export const root = createRoot(document.querySelector('#root') as HTMLElement)

root.render(<KitchenSink />)
