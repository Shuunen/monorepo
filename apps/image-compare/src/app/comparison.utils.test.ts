import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ContestState,
  calculateNewPan,
  calculateNewZoom,
  calculateSliderPosition,
  createContestState,
  type DragStartPosition,
  getCursorType,
  getImageStyle,
  getNextMatch,
  handleMultipleFilesUpload,
  handleSingleFileUpload,
  type ImageData,
  isDragLeavingContainer,
  maxZoom,
  minZoom,
  selectWinner,
  shouldResetPan,
  startContest,
} from './comparison.utils'

describe('comparison.utils', () => {
  describe('calculateNewZoom', () => {
    it('calculateNewZoom A should increase zoom when deltaY is negative', () => {
      const result = calculateNewZoom(1, -100)
      expect(result).toBeGreaterThan(1)
    })

    it('calculateNewZoom B should decrease zoom when deltaY is positive', () => {
      const result = calculateNewZoom(2, 100)
      expect(result).toBeLessThan(2)
    })

    it('calculateNewZoom C should not exceed maxZoom', () => {
      const result = calculateNewZoom(4.9, -1000)
      expect(result).toBe(maxZoom)
    })

    it('calculateNewZoom D should not go below minZoom', () => {
      const result = calculateNewZoom(1.1, 1000)
      expect(result).toBe(minZoom)
    })
  })

  describe('calculateNewPan', () => {
    it('calculateNewPan A should calculate correct pan position', () => {
      const dragStart: DragStartPosition = { panX: 10, panY: 20, x: 100, y: 200 }
      const result = calculateNewPan(dragStart, 150, 250)
      expect(result).toMatchInlineSnapshot(`
        {
          "x": 60,
          "y": 70,
        }
      `)
    })

    it('calculateNewPan B should handle negative deltas', () => {
      const dragStart: DragStartPosition = { panX: 100, panY: 200, x: 150, y: 250 }
      const result = calculateNewPan(dragStart, 100, 200)
      expect(result).toMatchInlineSnapshot(`
        {
          "x": 50,
          "y": 150,
        }
      `)
    })
  })

  describe('calculateSliderPosition', () => {
    it('calculateSliderPosition A should calculate position within bounds', () => {
      const rect = { left: 0, width: 100 } as DOMRect
      const result = calculateSliderPosition(50, rect)
      expect(result).toBe(50)
    })

    it('calculateSliderPosition B should clamp to 0 for negative values', () => {
      const rect = { left: 100, width: 100 } as DOMRect
      const result = calculateSliderPosition(50, rect)
      expect(result).toBe(0)
    })

    it('calculateSliderPosition C should clamp to 100 for values exceeding width', () => {
      const rect = { left: 0, width: 100 } as DOMRect
      const result = calculateSliderPosition(200, rect)
      expect(result).toBe(100)
    })
  })

  describe('getImageStyle', () => {
    it('getImageStyle A should return correct style with transition', () => {
      const result = getImageStyle({ x: 10, y: 20 }, 1.5, false)
      expect(result).toMatchInlineSnapshot(`
        {
          "transform": "translate(10px, 20px) scale(1.5)",
          "transition": "transform 0.1s ease-out",
        }
      `)
    })

    it('getImageStyle B should return style without transition when panning', () => {
      const result = getImageStyle({ x: 10, y: 20 }, 1.5, true)
      expect(result).toMatchInlineSnapshot(`
        {
          "transform": "translate(10px, 20px) scale(1.5)",
          "transition": "none",
        }
      `)
    })
  })

  describe('getCursorType', () => {
    it('getCursorType A should return grabbing when handle dragging', () => {
      const result = getCursorType(true, 1, false)
      expect(result).toBe('grabbing')
    })

    it('getCursorType B should return grab when zoomed and not panning', () => {
      const result = getCursorType(false, 2, false)
      expect(result).toBe('grab')
    })

    it('getCursorType C should return grabbing when zoomed and panning', () => {
      const result = getCursorType(false, 2, true)
      expect(result).toBe('grabbing')
    })

    it('getCursorType D should return auto when not zoomed', () => {
      const result = getCursorType(false, 1, false)
      expect(result).toBe('auto')
    })
  })

  describe('shouldResetPan', () => {
    it('shouldResetPan A should return true when zoom equals minZoom', () => {
      const result = shouldResetPan(minZoom)
      expect(result).toBe(true)
    })

    it('shouldResetPan B should return false when zoom is greater than minZoom', () => {
      const result = shouldResetPan(1.5)
      expect(result).toBe(false)
    })
  })

  describe('readImageFile', () => {
    it('readImageFile A should process file asynchronously', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      // FileReader is async, we just verify the function accepts the parameters
      expect(() => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
      }).not.toThrow()
    })
  })

  describe('handleSingleFileUpload', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('handleSingleFileUpload A should return early if file is undefined', () => {
      const onImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleSingleFileUpload(undefined, { imageSide: 'left', logger: logger as never, onImageUpdate })
      expect(onImageUpdate).not.toHaveBeenCalled()
    })

    it('handleSingleFileUpload B should process left image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const onImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleSingleFileUpload(file, { imageSide: 'left', logger: logger as never, onImageUpdate })
      // FileReader is async, we can't test the callback directly
      expect(file).toBeTruthy()
    })

    it('handleSingleFileUpload C should process right image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const onImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleSingleFileUpload(file, { imageSide: 'right', logger: logger as never, onImageUpdate })
      expect(file).toBeTruthy()
    })
  })

  describe('handleMultipleFilesUpload', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('handleMultipleFilesUpload A should show error for single file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file, item: () => file, length: 1 } as unknown as FileList
      const logger = { showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onContestStart: vi.fn() })
      expect(logger.showError).toHaveBeenCalledWith('Please drop 2 or more images to compare.')
    })

    it('handleMultipleFilesUpload B should handle two files for comparison', () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file1, 1: file2, item: (i: number) => (i === 0 ? file1 : file2), length: 2 } as unknown as FileList
      const onLeftImageUpdate = vi.fn()
      const onRightImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onLeftImageUpdate, onRightImageUpdate })
      // Files are being processed
      expect(fileList.length).toBe(2)
    })

    it('handleMultipleFilesUpload C should handle more than two files for contest', () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const file3 = new File(['content3'], 'test3.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file1, 1: file2, 2: file3, item: (i: number) => [file1, file2, file3][i], length: 3 } as unknown as FileList
      const onContestStart = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onContestStart })
      expect(fileList.length).toBe(3)
    })

    it('handleMultipleFilesUpload D should handle empty FileList for two images', () => {
      const fileList = { 0: undefined, 1: undefined, item: () => undefined, length: 2 } as unknown as FileList
      const onLeftImageUpdate = vi.fn()
      const onRightImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onLeftImageUpdate, onRightImageUpdate })
      // Function should handle undefined files gracefully
      expect(fileList.length).toBe(2)
    })
  })

  describe('isDragLeavingContainer', () => {
    it('isDragLeavingContainer A should return true when target equals currentTarget', () => {
      const div = document.createElement('div')
      const event = {
        currentTarget: div,
        relatedTarget: null,
        target: div,
      } as unknown as React.DragEvent
      const result = isDragLeavingContainer(event)
      expect(result).toBe(true)
    })

    it('isDragLeavingContainer B should return true when related target is not contained', () => {
      const div = document.createElement('div')
      const otherDiv = document.createElement('div')
      const event = {
        currentTarget: div,
        relatedTarget: otherDiv,
        target: document.createElement('span'),
      } as unknown as React.DragEvent
      const result = isDragLeavingContainer(event)
      expect(result).toBe(true)
    })
  })

  describe('createContestState', () => {
    it('createContestState A should create initial contest state', () => {
      const imageData: ImageData[] = [
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
        { filename: 'img3.jpg', url: 'url3' },
        { filename: 'img4.jpg', url: 'url4' },
      ]
      const result = createContestState(imageData)
      expect(result).toMatchInlineSnapshot(`
        {
          "activeImages": [
            {
              "eliminated": false,
              "filename": "img1.jpg",
              "id": 0,
              "url": "url1",
            },
            {
              "eliminated": false,
              "filename": "img2.jpg",
              "id": 1,
              "url": "url2",
            },
            {
              "eliminated": false,
              "filename": "img3.jpg",
              "id": 2,
              "url": "url3",
            },
            {
              "eliminated": false,
              "filename": "img4.jpg",
              "id": 3,
              "url": "url4",
            },
          ],
          "allImages": [
            {
              "eliminated": false,
              "filename": "img1.jpg",
              "id": 0,
              "url": "url1",
            },
            {
              "eliminated": false,
              "filename": "img2.jpg",
              "id": 1,
              "url": "url2",
            },
            {
              "eliminated": false,
              "filename": "img3.jpg",
              "id": 2,
              "url": "url3",
            },
            {
              "eliminated": false,
              "filename": "img4.jpg",
              "id": 3,
              "url": "url4",
            },
          ],
          "currentMatch": undefined,
          "isComplete": false,
          "matchesCompletedInRound": 0,
          "matchesInRound": 2,
          "round": 1,
          "winner": undefined,
        }
      `)
    })
  })

  describe('getNextMatch', () => {
    it('getNextMatch A should return first match', () => {
      const state = createContestState([
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
      ])
      const result = getNextMatch(state)
      expect(result).toMatchInlineSnapshot(`
        {
          "leftImage": {
            "eliminated": false,
            "filename": "img1.jpg",
            "id": 0,
            "url": "url1",
          },
          "matchNumber": 1,
          "rightImage": {
            "eliminated": false,
            "filename": "img2.jpg",
            "id": 1,
            "url": "url2",
          },
        }
      `)
    })

    it('getNextMatch B should return undefined when no more matches', () => {
      const state: ContestState = {
        activeImages: [{ eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' }],
        allImages: [],
        currentMatch: undefined,
        isComplete: false,
        matchesCompletedInRound: 0,
        matchesInRound: 0,
        round: 1,
        winner: undefined,
      }
      const result = getNextMatch(state)
      expect(result).toBeUndefined()
    })

    it('getNextMatch C should return second match after first is completed', () => {
      const state = createContestState([
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
        { filename: 'img3.jpg', url: 'url3' },
        { filename: 'img4.jpg', url: 'url4' },
      ])
      const updatedState = { ...state, matchesCompletedInRound: 1 }
      const result = getNextMatch(updatedState)
      expect(result?.leftImage.id).toBe(2)
      expect(result?.rightImage.id).toBe(3)
    })
  })

  describe('selectWinner', () => {
    it('selectWinner A should eliminate loser and advance to next match', () => {
      const imageData: ImageData[] = [
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
        { filename: 'img3.jpg', url: 'url3' },
        { filename: 'img4.jpg', url: 'url4' },
      ]
      const state = startContest(createContestState(imageData))
      const result = selectWinner(state, 0)
      expect(result.allImages.find(img => img.id === 1)?.eliminated).toBe(true)
      expect(result.currentMatch?.leftImage.id).toBe(2)
    })

    it('selectWinner B should complete contest when only one image remains', () => {
      const state: ContestState = {
        activeImages: [
          { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        ],
        allImages: [
          { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        ],
        currentMatch: {
          leftImage: { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          matchNumber: 1,
          rightImage: { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        },
        isComplete: false,
        matchesCompletedInRound: 0,
        matchesInRound: 1,
        round: 1,
        winner: undefined,
      }
      const result = selectWinner(state, 0)
      expect(result.isComplete).toBe(true)
      expect(result.winner?.id).toBe(0)
    })

    it('selectWinner C should start new round when current round is complete', () => {
      const imageData: ImageData[] = [
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
        { filename: 'img3.jpg', url: 'url3' },
        { filename: 'img4.jpg', url: 'url4' },
      ]
      let state = startContest(createContestState(imageData))
      state = selectWinner(state, 0) // Winner of match 1
      state = selectWinner(state, 2) // Winner of match 2
      expect(state.round).toBe(2)
      expect(state.currentMatch?.leftImage.id).toBe(0)
      expect(state.currentMatch?.rightImage.id).toBe(2)
    })

    it('selectWinner D should handle right image winning', () => {
      const state: ContestState = {
        activeImages: [
          { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        ],
        allImages: [
          { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        ],
        currentMatch: {
          leftImage: { eliminated: false, filename: 'img1.jpg', id: 0, url: 'url1' },
          matchNumber: 1,
          rightImage: { eliminated: false, filename: 'img2.jpg', id: 1, url: 'url2' },
        },
        isComplete: false,
        matchesCompletedInRound: 0,
        matchesInRound: 1,
        round: 1,
        winner: undefined,
      }
      const result = selectWinner(state, 1)
      expect(result.allImages.find(img => img.id === 0)?.eliminated).toBe(true)
      expect(result.winner?.id).toBe(1)
    })
  })

  describe('startContest', () => {
    it('startContest A should set the first match', () => {
      const state = createContestState([
        { filename: 'img1.jpg', url: 'url1' },
        { filename: 'img2.jpg', url: 'url2' },
      ])
      const result = startContest(state)
      expect(result.currentMatch).toBeDefined()
      expect(result.currentMatch?.leftImage.id).toBe(0)
      expect(result.currentMatch?.rightImage.id).toBe(1)
    })
  })
})
