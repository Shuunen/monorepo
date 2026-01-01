import { alignForSnap } from '@monorepo/utils'
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

const mockSharpToFile = vi.fn().mockResolvedValue(undefined)
const mockSharpJpeg = vi.fn().mockReturnValue({ toFile: mockSharpToFile })
const mockSharp = vi.fn().mockReturnValue({ jpeg: mockSharpJpeg })

vi.mock('sharp', () => ({
  default: mockSharp,
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
const {
  checkFile,
  cleanFilePath,
  checkFileDate,
  checkFilePathExtension,
  checkFilePathSpecialCharacters,
  checkFiles,
  checkPngTransparency,
  count,
  dateFromPath,
  getExifDateFromSiblings,
  getFiles,
  getNewExifDateBasedOnExistingDate: getNewExifDateTimeOriginal,
  logger,
  setFileDateBasedOnSiblings,
  setPhotoDate,
  showReport,
  start,
  toDate,
} = await import('./check-souvenirs.cli')
const { ExifDateTime } = await import('exiftool-vendored')

describe('check-souvenirs.cli', () => {
  beforeEach(() => {
    mockRead.mockResolvedValue({})
    mockWrite.mockResolvedValue(undefined)
    mockRewriteAllTags.mockResolvedValue(undefined)
    mockUnlink.mockResolvedValue(undefined)
    mockRename.mockResolvedValue(undefined)
    mockGlob.mockResolvedValue([])
    mockSharpToFile.mockResolvedValue(undefined)
    mockSharpJpeg.mockReturnValue({ toFile: mockSharpToFile })
    mockSharp.mockReturnValue({ jpeg: mockSharpJpeg })
    count.dateFixes = 0
    count.errors = 0
    count.scanned = 0
    count.warnings = 0
    logger.inMemoryLogs = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const dateFromPathTests = [
    {
      description: 'A regular case with year and month',
      input: 'D:\\Souvenirs\\2006\\2006-08_House Foobar\\P1000068.jpg',
      output: { month: '08', year: '2006' },
    },
    {
      description: 'B regular case with only year',
      input: 'D:\\Souvenirs\\2006\\Me puissance 10.jpg',
      output: { month: undefined, year: '2006' },
    },
    {
      description: 'C regular case with 00 month',
      input: 'D:\\Souvenirs\\2006\\2006-00_Term Mont-topaz-photo-lighting-face-upscale-2x.jpeg',
      output: { month: undefined, year: '2006' },
    },
    {
      description: 'D irregular case with no year or month',
      input: 'D:\\Souvenirs\\Miscellaneous\\random-file.png',
      output: { month: undefined, year: undefined },
    },
  ]

  for (const test of dateFromPathTests)
    it(`dateFromPath ${test.description}`, () => {
      const result = dateFromPath(test.input)
      if (!result.ok) throw new Error('Expected ok result')
      expect(result.value).toStrictEqual(test.output)
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

  it('getExifDateFromSiblings A should return ExifDateTime from previous sibling', async () => {
    const siblingDate = new ExifDateTime(2006, 8, 14, 10, 20, 30, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: siblingDate })
    const result = await getExifDateFromSiblings({
      currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`,
      nextFilePath: '',
      previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg`,
    })
    expect(result).toBeInstanceOf(ExifDateTime)
    expect(result?.year).toBe(2006)
  })

  it('getExifDateFromSiblings B should convert string DateTimeOriginal to ExifDateTime', async () => {
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: '2006-08-14T10:20:30' })
    const result = await getExifDateFromSiblings({
      currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`,
      nextFilePath: '',
      previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg`,
    })
    expect(result).toBeInstanceOf(ExifDateTime)
    expect(result?.year).toBe(2006)
    expect(result?.month).toBe(8)
  })

  it('getExifDateFromSiblings C should return undefined when no siblings have dates', async () => {
    mockRead.mockResolvedValue({})
    const result = await getExifDateFromSiblings({
      currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`,
      nextFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\next.jpg`,
      previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg`,
    })
    expect(result).toBeUndefined()
  })

  it('getNewExifDateTimeOriginal A should use path year when exifYearIncorrect is true and pathYear exists', () => {
    const originalExifDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    const exifDate = new Date(2005, 7, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: false,
      exifYearIncorrect: true,
      originalExifDate,
      pathMonth: undefined,
      pathYear: '2006',
    })
    expect(result.year).toBe(2006)
    expect(result.month).toBe(8)
  })

  it('getNewExifDateTimeOriginal B should use path month when exifMonthIncorrect is true and pathMonth exists', () => {
    const originalExifDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    const exifDate = new Date(2006, 6, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: true,
      exifYearIncorrect: false,
      originalExifDate,
      pathMonth: '08',
      pathYear: '2006',
    })
    expect(result.year).toBe(2006)
    expect(result.month).toBe(8)
  })

  it('getNewExifDateTimeOriginal C should use originalExifDate when exifYearIncorrect is false', () => {
    const originalExifDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    const exifDate = new Date(2006, 7, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: false,
      exifYearIncorrect: false,
      originalExifDate,
      pathMonth: undefined,
      pathYear: '2006',
    })
    expect(result.year).toBe(2006)
    expect(result.month).toBe(8)
  })

  it('getNewExifDateTimeOriginal D should use exifDate when originalExifDate is undefined', () => {
    const exifDate = new Date(2006, 7, 15, 12, 30, 45, 100)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: false,
      exifYearIncorrect: false,
      originalExifDate: undefined,
      pathMonth: undefined,
      pathYear: undefined,
    })
    expect(result.year).toBe(2006)
    expect(result.month).toBe(8)
    expect(result.day).toBe(15)
    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(100)
  })

  it('getNewExifDateTimeOriginal E should handle both year and month corrections', () => {
    const originalExifDate = new ExifDateTime(2005, 7, 15, 12, 30, 45, 0)
    const exifDate = new Date(2005, 6, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: true,
      exifYearIncorrect: true,
      originalExifDate,
      pathMonth: '08',
      pathYear: '2006',
    })
    expect(result.year).toBe(2006)
    expect(result.month).toBe(8)
  })

  it('getNewExifDateTimeOriginal F should use exifDate year when exifYearIncorrect is true but pathYear is undefined', () => {
    const originalExifDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    const exifDate = new Date(2005, 7, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: false,
      exifYearIncorrect: true,
      originalExifDate,
      pathMonth: undefined,
      pathYear: undefined,
    })
    expect(result.year).toBe(2005)
  })

  it('getNewExifDateTimeOriginal G should use exifDate month when exifMonthIncorrect is true but pathMonth is undefined', () => {
    const originalExifDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    const exifDate = new Date(2006, 6, 15, 12, 30, 45, 0)
    const result = getNewExifDateTimeOriginal({
      exifDate,
      exifMonthIncorrect: true,
      exifYearIncorrect: false,
      originalExifDate,
      pathMonth: undefined,
      pathYear: '2006',
    })
    expect(result.month).toBe(7)
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
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockRead).toHaveBeenCalled()
  })

  it('checkFileDate B should handle year mismatch', async () => {
    const originalDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate C should handle month mismatch', async () => {
    const originalDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate D should handle both year and month mismatch', async () => {
    const originalDate = new ExifDateTime(2005, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate E should handle string DateTimeOriginal', async () => {
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: '2005-08-15T12:30:45' })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFileDate F should handle correct date', async () => {
    const correctDate = new ExifDateTime(2006, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: correctDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('checkFileDate G should handle year mismatch with no path year', async () => {
    const originalDate = new ExifDateTime(2005, 8, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\random.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('checkFileDate H should handle month mismatch with no path month', async () => {
    const originalDate = new ExifDateTime(2006, 7, 15, 12, 30, 45, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: originalDate })
    await checkFileDate({ currentFilePath: String.raw`D:\Souvenirs\2006\random.jpg`, nextFilePath: '', previousFilePath: '' })
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('setFileDateBasedOnSiblings A should set date from previous sibling', async () => {
    const siblingDate = new ExifDateTime(2006, 8, 14, 10, 20, 30, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: siblingDate })
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg` }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
  })

  it('setFileDateBasedOnSiblings B should set date from next sibling', async () => {
    const siblingDate = new ExifDateTime(2006, 8, 16, 14, 25, 35, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: siblingDate })
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\next.jpg`, previousFilePath: '' }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
  })

  it('setFileDateBasedOnSiblings C should handle no siblings with dates', async () => {
    mockRead.mockResolvedValue({})
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\next.jpg`, previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg` }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
    const lastCall = mockWrite.mock.calls.at(-1)
    expect(lastCall).toMatchInlineSnapshot(`
      [
        "D:\\Souvenirs\\2006\\2006-08_House\\test.jpg",
        {
          "DateTimeOriginal": ExifDateTime2 {
            "day": 1,
            "hour": 0,
            "millisecond": 0,
            "minute": 0,
            "month": 8,
            "second": 0,
            "tzoffsetMinutes": undefined,
            "year": 2006,
          },
        },
      ]
    `)
  })

  it('setFileDateBasedOnSiblings D should correct year from sibling date', async () => {
    const siblingDate = new ExifDateTime(2005, 8, 14, 10, 20, 30, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: siblingDate })
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg` }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
    const writeCall = mockWrite.mock.calls[0]
    expect(writeCall[1].DateTimeOriginal.year).toBe(2006)
  })

  it('setFileDateBasedOnSiblings E should correct month from sibling date', async () => {
    const siblingDate = new ExifDateTime(2006, 7, 14, 10, 20, 30, 0)
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: siblingDate })
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg` }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
    const writeCall = mockWrite.mock.calls[0]
    expect(writeCall[1].DateTimeOriginal.month).toBe(8)
  })

  it('setFileDateBasedOnSiblings F should handle string DateTimeOriginal from sibling', async () => {
    // biome-ignore lint/style/useNamingConvention: its ok
    mockRead.mockResolvedValue({ DateTimeOriginal: '2006-08-14T10:20:30' })
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\prev.jpg` }, '2006', '08')
    expect(mockWrite).toHaveBeenCalled()
  })

  it('setFileDateBasedOnSiblings G should handle no siblings', async () => {
    await setFileDateBasedOnSiblings({ currentFilePath: String.raw`D:\Souvenirs\2006\2006-08_House\test.jpg`, nextFilePath: '', previousFilePath: '' }, '2007', '08')
    expect(mockWrite).toHaveBeenCalled()
  })

  it('checkFile A should check file and update count', async () => {
    mockRead.mockResolvedValue({})
    await checkFile({ currentFilePath: String.raw`D:\Souvenirs\2006\test.jpg`, nextFilePath: '', previousFilePath: '' })
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

  it('showReport D should display report with conversions and special chars fixes', () => {
    count.scanned = 10
    count.dateFixes = 5
    count.conversions = 2
    count.specialCharsFixes = 3
    count.errors = 0
    count.warnings = 0
    showReport()
    expect(logger.inMemoryLogs.some(log => log.includes('Nice no issues found'))).toBe(true)
  })

  it('showReport E should display report with zero scanned files', () => {
    count.scanned = 0
    count.dateFixes = 0
    count.conversions = 0
    count.specialCharsFixes = 0
    count.errors = 0
    count.warnings = 0
    showReport()
    expect(logger.inMemoryLogs.some(log => log.includes('Nice no issues found'))).toBe(true)
  })

  it('start A should execute full workflow', async () => {
    mockGlob.mockResolvedValue(['file1.jpg'])
    mockRead.mockResolvedValue({})
    await start()
    expect(count.scanned).toBe(1)
    expect(logger.inMemoryLogs.some(log => log.includes('Check Souvenirs is done'))).toBe(true)
  })

  it('checkFilePathExtension A should handle lowercase extension', async () => {
    const result = await checkFilePathExtension(String.raw`D:\Souvenirs\test.jpg`)
    expect(result).toBe(String.raw`D:\Souvenirs\test.jpg`)
  })

  it('checkFilePathExtension B should rename uppercase extension to lowercase', async () => {
    const result = await checkFilePathExtension(String.raw`D:\Souvenirs\test.JPG`)
    expect(mockRename).toHaveBeenCalledTimes(2)
    expect(result).toBe(String.raw`D:\Souvenirs\test.jpg`)
  })

  it('checkFilePathSpecialCharacters A should handle files without special characters', async () => {
    const result = await checkFilePathSpecialCharacters(String.raw`D:\Souvenirs\test.jpg`)
    expect(alignForSnap(result)).toMatchInlineSnapshot(`"D:/Souvenirs/test.jpg"`)
    expect(mockRename).not.toHaveBeenCalled()
  })

  it('checkFilePathSpecialCharacters B should rename files with special characters', async () => {
    const result = await checkFilePathSpecialCharacters(String.raw`D:\Souvenirs\test@file.jpg`)
    expect(mockRename).toHaveBeenCalledTimes(1)
    expect(alignForSnap(result)).toMatchInlineSnapshot(`"D:/Souvenirs/test-file.jpg"`)
  })

  it('checkPngTransparency A should skip non-PNG files', async () => {
    await checkPngTransparency(String.raw`D:\Souvenirs\test.jpg`)
    expect(mockRead).not.toHaveBeenCalled()
  })

  it('checkPngTransparency B should warn about PNG without ColorType tag', async () => {
    mockRead.mockResolvedValue({})
    await checkPngTransparency(String.raw`D:\Souvenirs\test.png`)
    expect(mockRead).toHaveBeenCalled()
    expect(logger.inMemoryLogs.some(log => log.includes('No ColorType tag found'))).toBe(true)
  })

  it('checkPngTransparency C should warn about RGB PNG without transparency', async () => {
    // biome-ignore lint/style/useNamingConvention: cant fix
    mockRead.mockResolvedValue({ ColorType: 'RGB' })
    await checkPngTransparency(String.raw`D:\Souvenirs\test.png`)
    expect(logger.inMemoryLogs.some(log => log.includes('PNG file without transparency detected'))).toBe(true)
    expect(mockSharp).toHaveBeenCalledWith(String.raw`D:\Souvenirs\test.png`)
    expect(mockSharpJpeg).toHaveBeenCalledWith({ quality: 90 })
    expect(mockSharpToFile).toHaveBeenCalledWith(String.raw`D:\Souvenirs\test.jpg`)
    expect(mockUnlink).toHaveBeenCalledWith(String.raw`D:\Souvenirs\test.png`)
  })

  it('checkPngTransparency D should not warn about PNG with RGBA ColorType', async () => {
    // biome-ignore lint/style/useNamingConvention: cant fix
    mockRead.mockResolvedValue({ ColorType: 'RGBA' })
    await checkPngTransparency(String.raw`D:\Souvenirs\test.png`)
    expect(logger.inMemoryLogs.some(log => log.includes('PNG file without transparency'))).toBe(false)
  })

  it('cleanFilePath A should warn about special characters in the path', async () => {
    const inputPath = String.raw`D:\Souvenirs\2006\2006-00_Super test@@@!folder\pic.png`
    await cleanFilePath(inputPath)
    expect(logger.inMemoryLogs.some(log => log.includes('contains forbidden characters'))).toBe(true)
  })

  it('cleanFilePath B should rename file with special characters', async () => {
    const inputPath = 'test!2!!&@*(file#.jpg'
    const result = await cleanFilePath(inputPath)
    expect(result).toMatchInlineSnapshot(`"test-2-file.jpg"`)
  })
})
