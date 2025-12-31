import { rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { blue, green, Logger, nbThird, Result, red, yellow } from '@monorepo/utils'
import { ExifDateTime, ExifTool } from 'exiftool-vendored'
import glob from 'tiny-glob'

// use me like :
//  cd /d/Souvenirs && bun ~/Projects/github/monorepo/apps/one-file/check-souvenirs.cli.ts
//  bun ~/Projects/github/monorepo/apps/one-file/check-souvenirs.cli.ts "/d/Souvenirs"
//  bun ~/Projects/github/monorepo/apps/one-file/check-souvenirs.cli.ts "/d/Souvenirs" --process-one

await using exif = new ExifTool()
const { argv } = process
const expectedNbParameters = 2
export const currentFolder = process.cwd()
export const logger = new Logger({ willOutputToMemory: true })
if (argv.length <= expectedNbParameters) logger.info('Targeting current folder, you can also specify a specific path, ex : check-souvenirs.cli.ts "D:\\Souvenirs\\" \n')
const photosPath = path.normalize(argv[expectedNbParameters] ?? currentFolder)
const willProcessOnlyOne = argv.includes('--process-one') || argv.includes('--one')

const regex = {
  year: /\\(?<year>\d{4})/,
  yearAndMonth: /\\(?<year>\d{4})-(?<month>\d{2})/,
}

export const count = {
  dateFixes: 0,
  errors: 0,
  scanned: 0,
  warnings: 0,
}

export function dateFromPath(filePath: string) {
  const yearAndMonth = regex.yearAndMonth.exec(filePath)?.groups
  if (yearAndMonth) return Result.ok({ month: yearAndMonth.month === '00' ? undefined : yearAndMonth.month, year: yearAndMonth.year })
  const year = regex.year.exec(filePath)?.groups
  if (year) return Result.ok({ month: undefined, year: year.year })
  return Result.ok({ month: undefined, year: undefined })
}

/**
 * Get files
 * @returns {string[]} list of files
 */
export async function getFiles() {
  logger.info(`Scanning dir ${blue(photosPath)}...`)
  const globPattern = '**/*.{jpg,jpeg,png}'
  const files = await glob(globPattern, { absolute: true, cwd: photosPath, filesOnly: true })
  logger.info(`Found ${blue(files.length.toString())} files with glob pattern ${blue(globPattern)}`)
  return files
}

export function toDate(data: string | ExifDateTime) {
  if (data instanceof ExifDateTime) return data.toDate()
  return new Date(data)
}

export function setPhotoDate(file: string, date: ExifDateTime) {
  logger.info(`Setting DateTimeOriginal for file ${file} to ${green(date?.toString() ?? 'undefined')}`)
  return (
    exif
      // biome-ignore lint/style/useNamingConvention: its ok
      .write(file, { DateTimeOriginal: date }) // first attempt
      .then(() => {
        logger.debug(`Successfully set DateTimeOriginal for file ${file} on first attempt`)
        count.dateFixes += 1
      })
      .catch(async () => {
        logger.debug(`Failed to write DateTimeOriginal for file ${file}, retrying...`)
        // sometimes exif tool fails to write the date, so we rewrite all tags as a workaround
        await exif.rewriteAllTags(file, `${file}.new`) // cant rewrite in place so write to new file
        await unlink(file) // remove original
        await rename(`${file}.new`, file) // rename new to original name
        logger.debug(`Rewrote all tags for file ${file}, retrying to set DateTimeOriginal...`)
        await exif
          // biome-ignore lint/style/useNamingConvention: its ok
          .write(file, { DateTimeOriginal: date }) // second attempt
          // oxlint-disable-next-line max-nested-callbacks
          .then(() => {
            logger.debug(`Successfully set DateTimeOriginal for file ${file} on second attempt`)
            count.dateFixes += 1
          })
          // oxlint-disable-next-line max-nested-callbacks
          .catch(error => {
            logger.error(`Failed again to write DateTimeOriginal for file ${file} : ${error}`)
          })
        logger.debug(`Successfully set DateTimeOriginal for file ${file} on second attempt`)
      })
      .finally(async () => {
        await unlink(`${file}_original`) // created by exif tool
      })
  )
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: will fix later
export async function checkFileDate(file: string) {
  const result = dateFromPath(file)
  if (!result.ok) {
    logger.error(`Cannot extract date from path ${file}`)
    return
  }
  const { month, year } = result.value
  logger.info(`Extracted date from path : year=${year ?? 'undefined'}, month=${month ?? 'undefined'}`)
  const tags = await exif.read(file)
  logger.info(`EXIF DateTimeOriginal : ${tags.DateTimeOriginal ?? 'undefined'}`)
  if (tags.DateTimeOriginal) {
    const originalExifDate = tags.DateTimeOriginal instanceof ExifDateTime ? tags.DateTimeOriginal : ExifDateTime.fromISO(tags.DateTimeOriginal)
    const exifDate = toDate(tags.DateTimeOriginal)
    const exifYear = exifDate.getFullYear().toString()
    const exifYearIncorrect = year && exifYear !== year
    const exifMonth = (exifDate.getMonth() + 1).toString().padStart(nbThird, '0')
    const exifMonthIncorrect = month && exifMonth !== month
    if (exifYearIncorrect) logger.info(`Year mismatch for file ${file} : ${green(year)} (from path), ${red(exifYear)} (from EXIF)`)
    if (exifMonthIncorrect) logger.info(`Month mismatch for file ${file} : ${green(month)} (from path), ${red(exifMonth)} (from EXIF)`)
    if (exifYearIncorrect || exifMonthIncorrect) {
      const newYear = exifYearIncorrect && year ? Number.parseInt(year, 10) : (originalExifDate?.year ?? exifDate.getFullYear())
      const newMonth = exifMonthIncorrect && month ? Number.parseInt(month, 10) : (originalExifDate?.month ?? exifDate.getMonth() + 1)
      const newExifDate = new ExifDateTime(
        newYear,
        newMonth,
        originalExifDate?.day ?? exifDate.getDate(),
        originalExifDate?.hour ?? exifDate.getHours(),
        originalExifDate?.minute ?? exifDate.getMinutes(),
        originalExifDate?.second ?? exifDate.getSeconds(),
        originalExifDate?.millisecond ?? exifDate.getMilliseconds(),
        originalExifDate?.tzoffsetMinutes,
      )
      await setPhotoDate(file, newExifDate)
    }
  } else logger.warn(`No DateTimeOriginal EXIF tag for file ${file}`)
}

/**
 * Check a file to remove unwanted characters and rename or delete it
 * @param {string} file - file name to check
 * @returns {void}
 * @example checkFile('video (2160p_25fps_AV1-128kbit_AAC-French).mp4')
 */
export async function checkFile(file: string) {
  count.scanned += 1
  if (willProcessOnlyOne) logger.info(`Checking file : ${blue(file)}`)
  else logger.debug(`Checking file : ${blue(file)}`)
  await checkFileDate(file)
}

/**
 * Check files to remove unwanted characters and rename or delete them
 * @param {string[]} files - list of files to rename
 */
export async function checkFiles(files: string[]) {
  if (willProcessOnlyOne && files.length > 0) {
    logger.info('Processing only one file as --process-one or --one is set')
    await checkFile(files[0])
    return
  }
  // oxlint-disable-next-line no-await-in-loop
  for (const file of files) await checkFile(file)
}

/**
 * Show the final report of operations
 */
export function showReport() {
  for (const log of logger.inMemoryLogs)
    if (log.includes('error')) count.errors += 1
    else if (log.includes('warn')) count.warnings += 1
  logger.info(`Report :`)
  logger.info(`- ${blue(count.scanned.toString())} files scanned`)
  logger.info(`- ${green(count.dateFixes.toString())} date fixes applied`)
  logger.info(`- ${red(count.errors.toString())} errors`)
  logger.info(`- ${yellow(count.warnings.toString())} warnings`)
  if (count.errors + count.warnings === 0) logger.success('Nice no issues found ( ͡° ͜ʖ ͡°)')
  else logger.warn('Some issues were found ಠ_ಠ')
}

/**
 * Start the check
 */
export async function start() {
  logger.info('Check Souvenirs started ✅')
  const files = await getFiles()
  await checkFiles(files)
  showReport()
  logger.success('Check Souvenirs is done')
}

/* v8 ignore next 2 -- @preserve */
// avoid running this script if it's imported for testing
if (process.argv[1]?.includes('check-souvenirs.cli.ts')) await start()

/**
 * Todo :
 * - [ ] Remove unwanted characters from file names
 * - [ ] Detect png without transparency and convert to jpg
 */
