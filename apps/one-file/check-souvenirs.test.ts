import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUnlink = vi.fn().mockResolvedValue(undefined)
const mockRename = vi.fn().mockResolvedValue(undefined)

vi.mock('node:fs/promises', () => ({
  rename: mockRename,
  unlink: mockUnlink,
}))

const mockGlob = vi.fn().mockResolvedValue([])

vi.mock('tiny-glob', () => ({
  default: mockGlob,
}))

const mockRead = vi.fn().mockResolvedValue({})
const mockWrite = vi.fn().mockResolvedValue(undefined)
const mockRewriteAllTags = vi.fn().mockResolvedValue(undefined)
const mockEnd = vi.fn()

vi.mock('exiftool-vendored', () => ({
  // biome-ignore lint/style/useNamingConvention: its ok
  ExifDateTime: class ExifDateTime {
    constructor(
      public year: number,
      public month: number,
      public day: number,
      public hour: number,
      public minute: number,
      public second: number,
      public millisecond: number,
      public tzoffsetMinutes?: number,
    ) {}
    toDate() {
      return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond)
    }
    toString() {
      return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}T${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}:${String(this.second).padStart(2, '0')}`
    }
    // biome-ignore lint/style/useNamingConvention: its ok
    static fromISO(str: string) {
      const date = new Date(str)
      return new ExifDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
    }
  },
  // biome-ignore lint/style/useNamingConvention: its ok
  ExifTool: class ExifTool {
    [Symbol.asyncDispose] = mockEnd
    end = mockEnd
    read = mockRead
    rewriteAllTags = mockRewriteAllTags
    write = mockWrite
  },
}))

// Import after mocks are set up
const { checkFile, checkFileDate, checkFiles, count, dateFromPath, getFiles, logger, setPhotoDate, showReport, start, toDate } = await import('./check-souvenirs.cli')
const { ExifDateTime } = await import('exiftool-vendored')

describe('check-souvenirs.cli', () => {
  beforeEach(() => {
    mockRead.mockResolvedValue({})
    mockWrite.mockResolvedValue(undefined)
    mockRewriteAllTags.mockResolvedValue(undefined)
    mockUnlink.mockResolvedValue(undefined)
    mockRename.mockResolvedValue(undefined)
    mockGlob.mockResolvedValue([])
    count.dateFixes = 0
    count.errors = 0
    count.scanned = 0
    count.warnings = 0
    logger.inMemoryLogs = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const tests = [
    {
      description: 'A regular case with year and month',
      expected: { month: '08', year: '2006' },
      input: 'D:\\Souvenirs\\2006\\2006-08_House Foobar\\P1000068.jpg',
    },
    {
      description: 'B regular case with only year',
      expected: { month: undefined, year: '2006' },
      input: 'D:\\Souvenirs\\2006\\Me puissance 10.jpg',
    },
    {
      description: 'C regular case with 00 month',
      expected: { month: undefined, year: '2006' },
      input: 'D:\\Souvenirs\\2006\\2006-00_Term Mont-topaz-photo-lighting-face-upscale-2x.jpeg',
    },
    {
      description: 'D irregular case with no year or month',
      expected: { month: undefined, year: undefined },
      input: 'D:\\Souvenirs\\Miscellaneous\\random-file.png',
    },
  ]

  for (const test of tests)
    it(`dateFromPath ${test.description}`, () => {
      const result = dateFromPath(test.input)
      if (!result.ok) throw new Error('Expected ok result')
      expect(result.value).toStrictEqual(test.expected)
    })

  it('getFiles A should return list of files', async () => {
    mockGlob.mockResolvedValue(['file1.jpg', 'file2.png'])
    const files = await getFiles()
    expect(files).toMatchInlineSnapshot(`
      [
        "file1.jpg",
        "file2.png",
      ]
    `)
  })

  it('toDate A should convert ExifDateTime to Date', () => {
    const exifDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    const date = toDate(exifDate)
    expect(date).toBeInstanceOf(Date)
    expect(date.getFullYear()).toBe(2006)
  })

  it('toDate B should convert string to Date', () => {
    const date = toDate('2006-08-15T12:30:45')
    expect(date).toBeInstanceOf(Date)
  })

  it('setPhotoDate A should set photo date successfully on first attempt', async () => {
    mockWrite.mockResolvedValue(undefined)
    const exifDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    await setPhotoDate('test.jpg', exifDate)
    // biome-ignore lint/style/useNamingConvention: its ok
    expect(mockWrite).toHaveBeenCalledWith('test.jpg', { DateTimeOriginal: exifDate })
    expect(count.dateFixes).toBe(1)
  })

  it('setPhotoDate B should handle write failure and retry with rewriteAllTags', async () => {
    mockWrite.mockRejectedValueOnce(new Error('Write failed')).mockResolvedValueOnce(undefined)
    const exifDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    await setPhotoDate('test.jpg', exifDate)
    expect(mockRewriteAllTags).toHaveBeenCalledWith('test.jpg', 'test.jpg.new')
    expect(mockWrite).toHaveBeenCalledTimes(2)
    expect(count.dateFixes).toBe(1)
  })

  it('setPhotoDate C should handle write failure twice', async () => {
    mockWrite.mockRejectedValue(new Error('Write failed'))
    const exifDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    await setPhotoDate('test.jpg', exifDate)
    expect(mockWrite).toHaveBeenCalledTimes(2)
    expect(count.dateFixes).toBe(0)
  })

  it('setPhotoDate D should handle undefined date', async () => {
    mockWrite.mockResolvedValue(undefined)
    await setPhotoDate('test.jpg', undefined as never)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate A should handle file without DateTimeOriginal', async () => {
    mockRead.mockResolvedValue({})
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockRead).toHaveBeenCalled()
  })

  it('checkFileDate B should handle year mismatch', async () => {
    const originalDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate C should handle month mismatch', async () => {
    const originalDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate D should handle both year and month mismatch', async () => {
    const originalDate = new ExifDateTime(2005, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate E should handle string DateTimeOriginal', async () => {
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: '2005-08-15T12:30:45' })
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate F should handle correct date', async () => {
    const correctDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: correctDate })
    await checkFileDate(String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`)
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('checkFileDate G should handle year mismatch with no path year', async () => {
    const originalDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate(String.raw`D:\Souvenirs\random.jpg`)
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('checkFileDate H should handle month mismatch with no path month', async () => {
    const originalDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate(String.raw`D:\Souvenirs\2006\random.jpg`)
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('checkFile A should check file and update count', async () => {
    mockRead.mockResolvedValue({})
    await checkFile(String.raw`D:\Souvenirs\2006\test.jpg`)
    expect(count.scanned).toBe(1)
  })

  it('checkFiles A should process all files', async () => {
    mockRead.mockResolvedValue({})
    await checkFiles(['file1.jpg', 'file2.jpg'])
    expect(count.scanned).toBe(2)
  })

  it('checkFiles B should process all files when --process-one not set', async () => {
    mockRead.mockResolvedValue({})
    await checkFiles(['file1.jpg', 'file2.jpg'])
    expect(count.scanned).toBe(2)
  })

  it('showReport A should display report with no issues', () => {
    count.scanned = 10
    count.dateFixes = 5
    count.errors = 0
    count.warnings = 0
    showReport()
    expect(logger.inMemoryLogs.some(log => log.includes('Nice no issues found'))).toBe(true)
  })

  it('showReport B should display report with errors', () => {
    count.scanned = 10
    count.dateFixes = 5
    logger.error('Test error')
    showReport()
    expect(count.errors).toBe(1)
    expect(logger.inMemoryLogs.some(log => log.includes('Some issues were found'))).toBe(true)
  })

  it('showReport C should display report with warnings', () => {
    count.scanned = 10
    count.dateFixes = 5
    logger.warn('Test warning')
    showReport()
    expect(count.warnings).toBe(1)
    expect(logger.inMemoryLogs.some(log => log.includes('Some issues were found'))).toBe(true)
  })

  it('start A should execute full workflow', async () => {
    mockGlob.mockResolvedValue(['file1.jpg'])
    mockRead.mockResolvedValue({})
    await start()
    expect(count.scanned).toBe(1)
    expect(logger.inMemoryLogs.some(log => log.includes('Check Souvenirs is done'))).toBe(true)
  })
})
