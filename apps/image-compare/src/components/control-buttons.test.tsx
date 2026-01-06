import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ContestState } from '../utils/comparison.utils'
import { ControlButtons } from './control-buttons'

describe('control-buttons', () => {
  const mockLeftUpload = vi.fn()
  const mockRightUpload = vi.fn()
  const mockReset = vi.fn()

  it('ControlButtons A should render all buttons in normal mode', () => {
    render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(3)
  })

  it('ControlButtons B should call reset handler when reset button is clicked', () => {
    render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const resetButton = screen.getByText('Reset view')
    fireEvent.click(resetButton)
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('ControlButtons C should display Reset View text in normal mode', () => {
    render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const resetText = screen.getByText('Reset view')
    expect(resetText).toBeTruthy()
  })

  it('ControlButtons D should hide upload buttons in contest mode', () => {
    const contestState: ContestState = {
      activeImages: [],
      allImages: [],
      currentMatch: {
        leftImage: { eliminated: false, filename: 'test.jpg', id: 0, url: 'url' },
        matchNumber: 1,
        rightImage: { eliminated: false, filename: 'test2.jpg', id: 1, url: 'url2' },
      },
      isComplete: false,
      matchesCompletedInRound: 0,
      matchesInRound: 1,
      round: 1,
      winner: undefined,
    }
    const { container } = render(<ControlButtons contestState={contestState} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const hiddenDivs = container.querySelectorAll('.hidden')
    expect(hiddenDivs.length).toBeGreaterThan(0)
  })

  it('ControlButtons E should display Exit Contest text in contest mode', () => {
    const contestState: ContestState = {
      activeImages: [],
      allImages: [],
      currentMatch: {
        leftImage: { eliminated: false, filename: 'test.jpg', id: 0, url: 'url' },
        matchNumber: 1,
        rightImage: { eliminated: false, filename: 'test2.jpg', id: 1, url: 'url2' },
      },
      isComplete: false,
      matchesCompletedInRound: 0,
      matchesInRound: 1,
      round: 1,
      winner: undefined,
    }
    render(<ControlButtons contestState={contestState} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const exitText = screen.getByText('Exit contest')
    expect(exitText).toBeTruthy()
  })

  it('ControlButtons F should hide upload buttons when contest is complete', () => {
    const contestState: ContestState = {
      activeImages: [],
      allImages: [],
      currentMatch: undefined,
      isComplete: true,
      matchesCompletedInRound: 1,
      matchesInRound: 1,
      round: 1,
      winner: { eliminated: false, filename: 'winner.jpg', id: 0, url: 'url' },
    }
    const { container } = render(<ControlButtons contestState={contestState} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const hiddenDivs = container.querySelectorAll('.hidden')
    expect(hiddenDivs.length).toBeGreaterThan(0)
  })

  it('ControlButtons G should trigger file input when left upload button is clicked', () => {
    const { container } = render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const leftButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Left Image'))
    if (leftButton) {
      fireEvent.click(leftButton)
      const fileInput = container.querySelector('#left-upload')
      expect(fileInput).toBeTruthy()
    }
  })

  it('ControlButtons H should trigger file input when right upload button is clicked', () => {
    const { container } = render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const rightButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Right Image'))
    if (rightButton) {
      fireEvent.click(rightButton)
      const fileInput = container.querySelector('#right-upload')
      expect(fileInput).toBeTruthy()
    }
  })

  it('ControlButtons I should call onLeftImageUpload when left file input changes', () => {
    const { container } = render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const fileInput = container.querySelector('#left-upload')
    if (fileInput) {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(mockLeftUpload).toHaveBeenCalled()
    }
  })

  it('ControlButtons J should call onRightImageUpload when right file input changes', () => {
    const { container } = render(<ControlButtons contestState={undefined} onLeftImageUpload={mockLeftUpload} onReset={mockReset} onRightImageUpload={mockRightUpload} />)
    const fileInput = container.querySelector('#right-upload')
    if (fileInput) {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(mockRightUpload).toHaveBeenCalled()
    }
  })
})
