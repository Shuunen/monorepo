import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting', () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )
    expect(getAllByText('recipes').length > 0).toBeTruthy()
  })
})
