import { render, screen } from '@testing-library/react'
import { Settings } from './settings'

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

  it('Settings C should display under construction message', () => {
    render(<Settings />)
    const message = screen.getByText('Settings page is under construction.')
    expect(message).toBeTruthy()
  })
})
