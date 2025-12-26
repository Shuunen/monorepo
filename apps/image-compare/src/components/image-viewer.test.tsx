import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ContestState } from '../utils/comparison.utils'
import { ImageViewer } from './image-viewer'

describe('image-viewer', () => {
  const mockProps = {
    contestState: undefined,
    cursor: 'auto' as const,
    imageContainerRef: createRef<HTMLDivElement>(),
    imageStyle: { transform: 'translate(0px, 0px) scale(1)', transition: 'transform 0.1s ease-out' },
    isDraggingOver: false,
    leftImage: '/left.jpg',
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onMouseDownOnHandle: vi.fn(),
    onMouseDownOnImage: vi.fn(),
    onMouseLeave: vi.fn(),
    onMouseMove: vi.fn(),
    onMouseUp: vi.fn(),
    onSelectWinner: vi.fn(),
    rightImage: '/right.jpg',
    sliderPosition: [50],
    zoom: 1,
  }

  it('ImageViewer A should render both images', () => {
    const { container } = render(<ImageViewer {...mockProps} />)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
  })

  it('ImageViewer B should display zoom level', () => {
    render(<ImageViewer {...mockProps} />)
    const zoomText = screen.getByText('Zoom: 100%')
    expect(zoomText).toBeTruthy()
  })

  it('ImageViewer C should hide choose buttons when not in contest mode', () => {
    const { container } = render(<ImageViewer {...mockProps} />)
    const hiddenButtons = container.querySelectorAll('.hidden')
    expect(hiddenButtons.length).toBeGreaterThan(0)
  })

  it('ImageViewer D should display choose buttons in contest mode', () => {
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
    render(<ImageViewer {...mockProps} contestState={contestState} />)
    const leftButton = screen.getByText('Choose Left')
    const rightButton = screen.getByText('Choose Right')
    expect(leftButton).toBeTruthy()
    expect(rightButton).toBeTruthy()
  })

  it('ImageViewer E should call onSelectWinner when choose button is clicked', () => {
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
    render(<ImageViewer {...mockProps} contestState={contestState} />)
    const leftButton = screen.getByText('Choose Left')
    fireEvent.click(leftButton)
    expect(mockProps.onSelectWinner).toHaveBeenCalledWith(0)
  })

  it('ImageViewer F should hide slider bar when contest is complete', () => {
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
    const { container } = render(<ImageViewer {...mockProps} contestState={contestState} />)
    const sliderBar = container.querySelector('[test-id="slider-bar"]')
    expect(sliderBar?.classList.contains('hidden')).toBe(true)
  })

  it('ImageViewer G should show drag over overlay when dragging', () => {
    render(<ImageViewer {...mockProps} isDraggingOver={true} />)
    const dropText = screen.getByText('Drop 2 images here')
    expect(dropText).toBeTruthy()
  })

  it('ImageViewer H should handle right image winning in contest', () => {
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
    render(<ImageViewer {...mockProps} contestState={contestState} />)
    const rightButton = screen.getByText('Choose Right')
    fireEvent.click(rightButton)
    expect(mockProps.onSelectWinner).toHaveBeenCalledWith(1)
  })
})
