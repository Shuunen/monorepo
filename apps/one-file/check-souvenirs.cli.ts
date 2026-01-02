// oxlint-disable max-lines
import { rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { blue, functionReturningVoid, green, Logger, nbThird, Result, red, yellow } from '@monorepo/utils'
import { Presets, SingleBar } from 'cli-progress'
import { ExifDateTime, ExifTool, type Maybe } from 'exiftool-vendored'
import sharp from 'sharp'
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
/* v8 ignore next -- @preserve */
if (argv.length <= expectedNbParameters) logger.info('Targeting current folder, you can also specify a specific path, ex : check-souvenirs.cli.ts "D:\\Souvenirs\\" \n')
const photosPath = path.normalize(argv[expectedNbParameters] ?? currentFolder)

const progressBar = new SingleBar(
  {
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    format: 'Progress |{bar}| {percentage}% | {value}/{total} files',
    hideCursor: true,
  },
  Presets.shades_classic,
)

export const options = {
  /** When dry active, avoid file modifications, useful for testing purposes */
  dry: argv.includes('--dry'),
  /** When true, process only the first file, useful for testing purposes */
  one: argv.includes('--process-one') || argv.includes('--one'),
}

const regex = {
  year: /\\(?<year>\d{4})/,
  yearAndMonth: /\\(?<year>\d{4})-(?<month>\d{2})/,
}

type File = {
  previousFilePath: string
  currentFilePath: string
  nextFilePath: string
}

export const count = {
  conversions: 0,
  dateFixes: 0,
  errors: 0,
  scanned: 0,
  specialCharsFixes: 0,
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
  const globPattern = '**/*.{jpg,JPG,jpeg,JPEG,png,PNG}'
  const files = await glob(globPattern, { absolute: true, cwd: photosPath, filesOnly: true })
  logger.info(`Found ${blue(files.length.toString())} files with glob pattern ${blue(globPattern)}`)
  return files
}

export function toDate(data: string | ExifDateTime) {
  if (data instanceof ExifDateTime) return data.toDate()
  return new Date(data)
}

// oxlint-disable-next-line max-lines-per-function
export function setPhotoDate(file: string, date: ExifDateTime) {
  logger.info(`Setting DateTimeOriginal for file ${file} to ${green(date?.toString() ?? 'undefined')}`)
  /* v8 ignore next -- @preserve */
  if (options.dry) {
    logger.info(blue('Dry run enabled, avoid setting date'))
    return Promise.resolve()
  }
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
        // created by exif tool
        // oxlint-disable-next-line max-nested-callbacks
        await unlink(`${file}_original`).catch(functionReturningVoid)
      })
  )
}

export function getNewExifDateBasedOnExistingDate({ pathYear, pathMonth, originalExifDate, exifYearIncorrect, exifMonthIncorrect, exifDate }: { pathYear?: string; pathMonth?: string; originalExifDate: Maybe<ExifDateTime>; exifYearIncorrect: boolean; exifMonthIncorrect: boolean; exifDate: Date }) {
  const newYear = exifYearIncorrect && pathYear ? Number.parseInt(pathYear, 10) : (originalExifDate?.year ?? exifDate.getFullYear())
  const newMonth = exifMonthIncorrect && pathMonth ? Number.parseInt(pathMonth, 10) : (originalExifDate?.month ?? exifDate.getMonth() + 1)
  const newExifDate = new ExifDateTime(
    newYear,
    newMonth,
    originalExifDate?.day ?? exifDate.getDate(),
    originalExifDate?.hour ?? exifDate.getHours(),
    originalExifDate?.minute ?? exifDate.getMinutes(),
    originalExifDate?.second ?? exifDate.getSeconds(),
    originalExifDate?.millisecond ?? exifDate.getMilliseconds(), // cspell: disable-next-line
    originalExifDate?.tzoffsetMinutes,
  )
  return newExifDate
}

export async function checkFileDateTimeOriginal({ file, dateTimeOriginal, pathYear, pathMonth }: { file: string; dateTimeOriginal: string | ExifDateTime; pathYear: string; pathMonth?: string }) {
  const originalExifDate = dateTimeOriginal instanceof ExifDateTime ? dateTimeOriginal : ExifDateTime.fromISO(dateTimeOriginal)
  const exifDate = toDate(dateTimeOriginal)
  const exifYear = exifDate.getFullYear().toString()
  const exifYearIncorrect = exifYear !== pathYear
  const exifMonth = (exifDate.getMonth() + 1).toString().padStart(nbThird, '0')
  const exifMonthIncorrect = pathMonth !== undefined && exifMonth !== pathMonth
  if (exifYearIncorrect) logger.info(`Year mismatch for file ${file} : ${green(pathYear)} (from path), ${red(exifYear)} (from EXIF)`)
  if (exifMonthIncorrect) logger.info(`Month mismatch for file ${file} : ${green(pathMonth)} (from path), ${red(exifMonth)} (from EXIF)`)
  if (exifYearIncorrect || exifMonthIncorrect) {
    const newExifDate = getNewExifDateBasedOnExistingDate({ exifDate, exifMonthIncorrect, exifYearIncorrect, originalExifDate, pathMonth, pathYear })
    await setPhotoDate(file, newExifDate)
  }
}

export async function getExifDateFromSiblings(file: File): Promise<ExifDateTime | undefined> {
  const siblings = [file.previousFilePath, file.nextFilePath].filter(sibling => sibling !== '')
  const referenceDate: ExifDateTime | undefined = await (async () => {
    for (const sibling of siblings) {
      // oxlint-disable-next-line no-await-in-loop
      const tags = await exif.read(sibling)
      if (!tags.DateTimeOriginal) continue
      /* v8 ignore next -- @preserve */
      logger.debug(`Found DateTimeOriginal in sibling file ${sibling} : ${green(tags.DateTimeOriginal.toString() ?? 'undefined')}`)
      return tags.DateTimeOriginal instanceof ExifDateTime ? tags.DateTimeOriginal : (ExifDateTime.fromISO(tags.DateTimeOriginal) as ExifDateTime)
    }
    return undefined
  })()
  return referenceDate
}

export function getExifDateFromYearAndMonth(pathYear: string, pathMonth?: string) {
  const isoString = `${pathYear}-${pathMonth ?? '01'}-01T00:00:00.000`
  return ExifDateTime.fromISO(isoString) as ExifDateTime
}

export async function getNewExifDateBasedOnSiblings(file: File, pathYear: string, pathMonth?: string) {
  const referenceDate = (await getExifDateFromSiblings(file)) ?? getExifDateFromYearAndMonth(pathYear, pathMonth)
  const exifDate = toDate(referenceDate)
  const exifYear = exifDate.getFullYear().toString()
  const exifYearIncorrect = exifYear !== pathYear
  const exifMonth = (exifDate.getMonth() + 1).toString().padStart(nbThird, '0')
  const exifMonthIncorrect = pathMonth !== undefined && exifMonth !== pathMonth
  const newExifDate = getNewExifDateBasedOnExistingDate({ exifDate, exifMonthIncorrect, exifYearIncorrect, originalExifDate: referenceDate, pathMonth, pathYear })
  return newExifDate
}

export async function setFileDateBasedOnSiblings(file: File, pathYear: string, pathMonth?: string) {
  logger.info(`No DateTimeOriginal EXIF tag for file ${file.currentFilePath}, checking siblings...`)
  const newExifDate = await getNewExifDateBasedOnSiblings(file, pathYear, pathMonth)
  await setPhotoDate(file.currentFilePath, newExifDate)
}

export async function checkFileDate(file: File) {
  const { month: pathMonth, year: pathYear } = dateFromPath(file.currentFilePath).value
  logger.debug(`Extracted date from path : year=${pathYear ?? 'undefined'}, month=${pathMonth ?? 'undefined'}`)
  if (!pathYear) {
    logger.warn(`No year found in path for file ${file.currentFilePath}, skipping date check`)
    return
  }
  const tags = await exif.read(file.currentFilePath)
  logger.debug(`Extracted DateTimeOriginal from exif : DateTimeOriginal=${tags.DateTimeOriginal ?? 'undefined'}`)
  if (tags.DateTimeOriginal) await checkFileDateTimeOriginal({ dateTimeOriginal: tags.DateTimeOriginal, file: file.currentFilePath, pathMonth, pathYear })
  else await setFileDateBasedOnSiblings(file, pathYear, pathMonth)
}

export async function checkFilePathExtension(filePath: string): Promise<string> {
  const extension = path.extname(filePath)
  const isUpperCaseExtension = extension !== extension.toLowerCase()
  if (!isUpperCaseExtension) return filePath
  const newFilePath = filePath.slice(0, -extension.length) + extension.toLowerCase()
  const tempFilePath = `${filePath}.tmp_renaming`
  logger.info(`Renaming file ${filePath} to ${newFilePath} to have lowercase extension`)
  /* v8 ignore next -- @preserve */
  if (options.dry) {
    logger.info(blue('Dry run enabled, avoid renaming file'))
    return newFilePath
  }
  await rename(filePath, tempFilePath)
  await rename(tempFilePath, newFilePath)
  return newFilePath
}

const forbiddenCharsInFileName = /[^a-zA-Z0-9._\- éèêëàâäôöùûüç]/g
const forbiddenCharsInFilePath = /[^a-zA-Z0-9._\- \\/:éèêëàâäôöùûüç]/g
const trailingDashes = /-+$/

export function cleanFilePath(filePath: string): string {
  const basename = path.basename(filePath)
  const extension = path.extname(basename)
  const nameWithoutExtension = basename.slice(0, basename.length - extension.length)
  const cleanName = nameWithoutExtension.replaceAll(forbiddenCharsInFileName, '-').replaceAll(/-+/g, '-').replace(trailingDashes, '').trim()
  const newFileName = cleanName + extension
  const newFilePath = path.join(path.dirname(filePath), newFileName)
  const directoryPath = path.dirname(filePath)
  if (forbiddenCharsInFilePath.test(directoryPath)) logger.warn(`File path ${filePath} contains forbidden characters`)
  if (newFilePath === filePath) return filePath
  return newFilePath
}

export async function checkFilePathSpecialCharacters(filePath: string): Promise<string> {
  const newFilePath = cleanFilePath(filePath)
  if (newFilePath === filePath) return filePath
  logger.info(`Renaming file ${filePath} to ${newFilePath} to remove special characters`)
  /* v8 ignore next -- @preserve */
  if (options.dry) {
    logger.info(blue('Dry run enabled, avoid renaming file'))
    return newFilePath
  }
  await rename(filePath, newFilePath)
  count.specialCharsFixes += 1
  return newFilePath
}

export async function checkPngTransparency(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  if (extension !== '.png') return filePath // no need to check other file types
  const tags = await exif.read(filePath)
  if (!('ColorType' in tags)) {
    logger.warn(`No ColorType tag found for PNG file: ${filePath}. Unable to determine transparency.`)
    return filePath
  }
  if (tags.ColorType !== 'RGB') return filePath // has transparency
  logger.info(`PNG file without transparency detected: ${filePath}. Converting to JPG...`)
  /* v8 ignore next -- @preserve */
  if (options.dry) {
    logger.info(blue('Dry run enabled, avoid converting file'))
    return filePath
  }
  const jpgFilePath = `${filePath.slice(0, -extension.length)}.jpg`
  await sharp(filePath).jpeg({ quality: 90 }).toFile(jpgFilePath)
  logger.info(`Converted ${filePath} to ${green(jpgFilePath)}`)
  await unlink(filePath).catch(functionReturningVoid)
  logger.debug(`Deleted original PNG file: ${filePath}`)
  count.conversions += 1
  return jpgFilePath
}

/**
 * Check a file against various criteria
 * @param  file - file collection to check
 * @returns nothing
 */
export async function checkFile(file: File) {
  count.scanned += 1
  /* v8 ignore next -- @preserve */
  if (options.one) logger.debug(`Checking file : ${blue(file.currentFilePath)}`)
  else logger.debug(`Checking file : ${blue(file.currentFilePath)}`)
  file.currentFilePath = await checkFilePathExtension(file.currentFilePath)
  file.currentFilePath = await checkFilePathSpecialCharacters(file.currentFilePath)
  file.currentFilePath = await checkPngTransparency(file.currentFilePath)
  await checkFileDate(file)
}

/**
 * Check files to remove unwanted characters and rename or delete them
 * @param {string[]} files - list of files to rename
 */
export async function checkFiles(files: string[]) {
  /* v8 ignore next 4 -- @preserve */
  if (options.one && files.length > 0) {
    logger.info('Processing only one file as --process-one or --one is set')
    await checkFile({ currentFilePath: files[0], nextFilePath: files[1] ?? '', previousFilePath: '' })
    return
  }
  progressBar.start(files.length, 0)
  // await Promise.all(files.map((file, index) => checkFile({ currentFilePath: file, nextFilePath: files[index + 1] ?? '', previousFilePath: files[index - 1] ?? '' })))
  for (const [index, file] of files.entries()) {
    // oxlint-disable-next-line no-await-in-loop
    await checkFile({ currentFilePath: file, nextFilePath: files[index + 1] ?? '', previousFilePath: files[index - 1] ?? '' })
    progressBar.update(index + 1)
  }
  progressBar.stop()
}

/**
 * Show the final report of operations
 */
export function showReport() {
  for (const log of logger.inMemoryLogs)
    if (log.includes('error')) count.errors += 1
    else if (log.includes('warn')) count.warnings += 1
  logger.info(`Report :`)
  logger.info(`- ${count.scanned > 0 ? blue(count.scanned.toString()) : '0'} files scanned`)
  logger.info(`- ${count.dateFixes > 0 ? green(count.dateFixes.toString()) : '0'} date fixes applied`)
  logger.info(`- ${count.conversions > 0 ? green(count.conversions.toString()) : '0'} png to jpg conversions`)
  logger.info(`- ${count.specialCharsFixes > 0 ? green(count.specialCharsFixes.toString()) : '0'} special characters fixes applied`)
  logger.info(`- ${count.errors > 0 ? red(count.errors.toString()) : '0'} errors`)
  logger.info(`- ${count.warnings > 0 ? yellow(count.warnings.toString()) : '0'} warnings`)
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
