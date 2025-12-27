import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ContestState } from '../utils/comparison.utils'
import { ImageViewer } from './image-viewer'

describe('image-viewer', () => {
  const mockProps = {
    containerHeight: 600,
    contestState: undefined,
    cursor: 'auto' as const,
    imageContainerRef: createRef<HTMLDivElement>(),
    imageStyle: { transform: 'translate(0px, 0px) scale(1)', transition: 'transform 0.1s ease-out' },
    isDraggingLeft: false,
    isDraggingOver: false,
    leftImage: '/left.jpg',
    nbDraggedFiles: 0,
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

  it('ImageViewer C should have choose buttons with zero opacity when not in contest mode', () => {
    render(<ImageViewer {...mockProps} />)
    const leftButton = screen.getByText('Choose left image')
    const rightButton = screen.getByText('Choose right image')
    expect(leftButton).toBeTruthy()
    expect(rightButton).toBeTruthy()
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
    const leftButton = screen.getByText('Choose left image')
    const rightButton = screen.getByText('Choose right image')
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
    const leftButton = screen.getByText('Choose left image')
    fireEvent.click(leftButton)
    expect(mockProps.onSelectWinner).toHaveBeenCalledWith(0)
  })

  it('ImageViewer F should show slider bar even when contest is complete', () => {
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
    expect(sliderBar).toBeTruthy()
  })

  it('ImageViewer G should show drag over overlay when dragging 2 files', () => {
    render(<ImageViewer {...mockProps} isDraggingOver={true} nbDraggedFiles={2} />)
    const dropText = screen.getByText('Drop these 2 images to compare them')
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
    const rightButton = screen.getByText('Choose right image')
    fireEvent.click(rightButton)
    expect(mockProps.onSelectWinner).toHaveBeenCalledWith(1)
  })

  it('ImageViewer I should show left/right side messages when dragging 1 file', () => {
    render(<ImageViewer {...mockProps} isDraggingLeft={true} isDraggingOver={true} nbDraggedFiles={1} />)
    const leftMessage = screen.getByText('Change left image')
    const rightMessage = screen.getByText('Change right image')
    expect(leftMessage).toBeTruthy()
    expect(rightMessage).toBeTruthy()
  })

  it('ImageViewer J should show contest message when dragging 3+ files', () => {
    render(<ImageViewer {...mockProps} isDraggingOver={true} nbDraggedFiles={3} />)
    const contestMessage = screen.getByText('Drop these 3 images to start a contest')
    expect(contestMessage).toBeTruthy()
  })

  it('ImageViewer K should show right side highlighted when dragging 1 file over right side', () => {
    render(<ImageViewer {...mockProps} isDraggingLeft={false} isDraggingOver={true} nbDraggedFiles={1} />)
    const sideMessage = screen.getByText('Change right image')
    expect(sideMessage).toBeTruthy()
  })
})
