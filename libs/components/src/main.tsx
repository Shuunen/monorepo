/* c8 ignore start */
import { createRoot } from 'react-dom/client'
import { Landing } from './molecules/landing'

export const root = createRoot(document.querySelector('#root') as HTMLElement)

root.render(<Landing status="Ready for development" subtitle="This React app is just a placeholder to hook Storybook" title="Components" />)
