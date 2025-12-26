import { render, screen } from '@testing-library/react'
import { Settings } from './settings.tab'

describe('settings', () => {
  it('Settings A should render successfully', () => {
    const { container } = render(<Settings />)
    expect(container).toBeTruthy()
  })

  it('Settings B should display settings title', () => {
    render(<Settings />)
    const title = screen.getByText('Settings')
    expect(title).toBeTruthy()
  })
})
