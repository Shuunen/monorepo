import { render, screen } from '@testing-library/react'
import type { ContestState } from './comparison.utils'
import { ContestHeader } from './contest-header'

describe('contest-header', () => {
  const mockContestState: ContestState = {
    activeImages: [
      { eliminated: false, filename: 'image1.jpg', id: 0, url: 'url1' },
      { eliminated: false, filename: 'image2.jpg', id: 1, url: 'url2' },
    ],
    allImages: [
      { eliminated: false, filename: 'image1.jpg', id: 0, url: 'url1' },
      { eliminated: false, filename: 'image2.jpg', id: 1, url: 'url2' },
    ],
    currentMatch: {
      leftImage: { eliminated: false, filename: 'image1.jpg', id: 0, url: 'url1' },
      matchNumber: 1,
      rightImage: { eliminated: false, filename: 'image2.jpg', id: 1, url: 'url2' },
    },
    isComplete: false,
    matchesCompletedInRound: 0,
    matchesInRound: 1,
    round: 1,
    winner: undefined,
  }

  it('ContestHeader A should return undefined when not in contest mode and not complete', () => {
    const { container } = render(<ContestHeader contestState={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('ContestHeader B should display contest mode header', () => {
    render(<ContestHeader contestState={mockContestState} />)
    const header = screen.getByText('Round 1 - Match 1')
    expect(header).toBeTruthy()
  })

  it('ContestHeader C should display select your preferred image message', () => {
    render(<ContestHeader contestState={mockContestState} />)
    const message = screen.getByText('Select your preferred image')
    expect(message).toBeTruthy()
  })

  it('ContestHeader D should display winner header when contest is complete', () => {
    const completeState: ContestState = {
      ...mockContestState,
      currentMatch: undefined,
      isComplete: true,
      winner: { eliminated: false, filename: 'winner.jpg', id: 0, url: 'winner-url' },
    }
    render(<ContestHeader contestState={completeState} />)
    const header = screen.getByText('🏆 We have a winner !')
    expect(header).toBeTruthy()
  })

  it('ContestHeader E should display winner filename when contest is complete', () => {
    const completeState: ContestState = {
      ...mockContestState,
      currentMatch: undefined,
      isComplete: true,
      winner: { eliminated: false, filename: 'winner.jpg', id: 0, url: 'winner-url' },
    }
    render(<ContestHeader contestState={completeState} />)
    const filename = screen.getByText('winner.jpg')
    expect(filename).toBeTruthy()
  })
})
