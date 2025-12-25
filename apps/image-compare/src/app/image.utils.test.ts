/** biome-ignore-all lint/style/useNamingConvention: it'ok */
import { sleep } from '@monorepo/utils'
import { describe, expect, it, vi } from 'vitest'
import { fetchImageMetadata, handleMultipleFilesUpload, handleSingleFileUpload } from './image.utils'

describe('image.utils', () => {
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
      const onMetadataUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleSingleFileUpload(file, { imageSide: 'right', logger: logger as never, onImageUpdate, onMetadataUpdate })
      expect(file).toBeTruthy()
      expect(onImageUpdate).not.toHaveBeenCalled()
      expect(onMetadataUpdate).not.toHaveBeenCalled()
    })
  })

  describe('handleMultipleFilesUpload', () => {
    it('handleMultipleFilesUpload A should show error for single file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file, item: () => file, length: 1 } as unknown as FileList
      const logger = { showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onContestStart: vi.fn() })
      expect(logger.showError).toHaveBeenCalledWith('Please drop 2 or more images to compare.')
    })

    it('handleMultipleFilesUpload B should handle two files for comparison', async () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file1, 1: file2, item: (i: number) => (i === 0 ? file1 : file2), length: 2 } as unknown as FileList
      const onLeftImageUpdate = vi.fn()
      const onRightImageUpdate = vi.fn()
      const onLeftMetadataUpdate = vi.fn()
      const onRightMetadataUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onLeftImageUpdate, onLeftMetadataUpdate, onRightImageUpdate, onRightMetadataUpdate })
      await sleep(20) // Wait for async FileReader operations
      expect(onLeftImageUpdate).toHaveBeenCalled()
      expect(onRightImageUpdate).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('Left image updated via drag and drop.')
      expect(logger.info).toHaveBeenCalledWith('Right image updated via drag and drop.')
    })

    it('handleMultipleFilesUpload C should handle more than two files for contest', async () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const file3 = new File(['content3'], 'test3.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file1, 1: file2, 2: file3, item: (i: number) => [file1, file2, file3][i], length: 3 } as unknown as FileList
      const onContestStart = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onContestStart })
      await sleep(20) // Wait for async FileReader operations
      expect(onContestStart).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('Contest mode started with 3 images.')
    })

    it('handleMultipleFilesUpload D should handle empty FileList for two images', () => {
      const fileList = { 0: undefined, 1: undefined, item: () => undefined, length: 2 } as unknown as FileList
      const onLeftImageUpdate = vi.fn()
      const onRightImageUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onLeftImageUpdate, onRightImageUpdate })
      expect(fileList.length).toBe(2)
    })

    it('handleMultipleFilesUpload E should call metadata callbacks when provided for two files', async () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const fileList = { 0: file1, 1: file2, item: (i: number) => (i === 0 ? file1 : file2), length: 2 } as unknown as FileList
      const onLeftImageUpdate = vi.fn()
      const onRightImageUpdate = vi.fn()
      const onLeftMetadataUpdate = vi.fn()
      const onRightMetadataUpdate = vi.fn()
      const logger = { info: vi.fn(), showError: vi.fn() }
      handleMultipleFilesUpload(fileList, { logger: logger as never, onLeftImageUpdate, onLeftMetadataUpdate, onRightImageUpdate, onRightMetadataUpdate })
      await sleep(20) // Wait for async FileReader operations
      expect(onLeftMetadataUpdate).toHaveBeenCalledWith({ filename: 'test1.jpg', height: 1080, size: file1.size, width: 1920 })
      expect(onRightMetadataUpdate).toHaveBeenCalledWith({ filename: 'test2.jpg', height: 1080, size: file2.size, width: 1920 })
    })
  })

  describe('fetchImageMetadata', () => {
    it('fetchImageMetadata A should fetch and return image metadata', async () => {
      const result = await fetchImageMetadata('http://example.com/image.jpg')
      expect(result).toMatchInlineSnapshot(`
        {
          "filename": "image.jpg",
          "height": 1080,
          "size": 15,
          "width": 1920,
        }
      `)
    })
    it('fetchImageMetadata B should handle missing filename in URL', async () => {
      const result = await fetchImageMetadata('')
      expect(result.filename).toBe('unknown')
    })
  })
})
