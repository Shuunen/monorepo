import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { Result } from './result.js'
import { generateMark, getPackageJsonVersion, getTargetFiles, init, injectMarkInFiles } from './unique-mark.js'

describe('unique-mark', () => {
  it('getPackageJsonVersion A', () => {
    const result = Result.unwrap(getPackageJsonVersion())
    expect(result.error).toMatchInlineSnapshot(`undefined`)
    expect(result.value?.startsWith('0.0.')).toBe(true)
  })

  it('getPackageJsonVersion B pkg file not found', () => {
    const result = Result.unwrap(getPackageJsonVersion('non-existent.json'))
    expect(result.error).toMatchInlineSnapshot(`"package.json was not found in non-existent.json, aborting."`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('getPackageJsonVersion C pkg file found but invalid json', () => {
    const result = Result.unwrap(getPackageJsonVersion('README.md'))
    expect(result.error).toMatchInlineSnapshot(`"package.json in README.md is not a valid JSON (error : Invalid JSON string: Unexpected token '#', "# Shuutils"... is not valid JSON), aborting."`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('getTargetFiles A list markdown files at root dir', async () => {
    const result = Result.unwrap(await getTargetFiles('*.{md}'))
    expect(result.error).toMatchInlineSnapshot(`undefined`)
    expect(result.value).toMatchInlineSnapshot(`
      [
        "README.md",
      ]
    `)
  })

  it('getTargetFiles B list without target', async () => {
    const result = Result.unwrap(await getTargetFiles())
    expect(result.error).toMatchInlineSnapshot(`"no target specified, aborting."`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('getTargetFiles C list with invalid extension', async () => {
    const result = Result.unwrap(await getTargetFiles('*.js'))
    expect(result.error).toMatchInlineSnapshot(`"provided : "*.js", you need to use *.{js} to capture all files with that extension (limitation of tiny-glob)"`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('getTargetFiles D list with no files found', async () => {
    const result = Result.unwrap(await getTargetFiles('*.nope'))
    expect(result.error).toMatchInlineSnapshot(`"provided : "*.nope", you need to use *.{nope} to capture all files with that extension (limitation of tiny-glob)"`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('getTargetFiles E returns error when no files found for valid extension', async () => {
    const result = Result.unwrap(await getTargetFiles('no-such-file.{js}'))
    expect(result.error).toMatchInlineSnapshot(`"no file found for target "no-such-file.{js}", aborting."`)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  const fakeMark = '9.7.8 - xyz - 07/05/2023 17:26:35'
  it('generateMark A', () => {
    expect(generateMark({ commit: 'xyz', date: '07/05/2023 17:26:35', version: '9.7.8' })).toEqual(fakeMark)
  })

  const targetFiles = ['src/lib/strings.ts']

  it('injectMarkInFiles A successful', () => {
    const result = Result.unwrap(injectMarkInFiles({ files: targetFiles, isReadOnly: true, mark: fakeMark, placeholder: 'placeholder' }))
    expect(result.error).toMatchInlineSnapshot(`undefined`)
    expect(result.value).toMatchInlineSnapshot(`
      {
        "logs": [
          "injected in src/lib/strings.ts : 7 times",
        ],
        "totalInjections": 7,
      }
    `)
  })

  it('injectMarkInFiles B fail to find placeholder', () => {
    const result = Result.unwrap(injectMarkInFiles({ files: targetFiles, isReadOnly: true, mark: fakeMark, placeholder: 'nope' }))
    expect(result.error).toMatchInlineSnapshot(`
      "could not find a place to inject in src/lib/strings.ts, aborting.

      Please use one or more of these placeholders :  <span id="nope"></span>  <meta name="nope" content="">  __nope__"
    `)
    expect(result.value).toMatchInlineSnapshot(`undefined`)
  })

  it('init A no targets', () => {
    expect(init()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: no target specified, aborting.]`)
  })

  it('init B missing placeholder', () => {
    writeFileSync('test.log', 'console.log("hello shuutils !");')
    expect(init('test.{log}')).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: could not find a place to inject in test.log, aborting.

      Please use one or more of these placeholders :  <span id="unique-mark"></span>  <meta name="unique-mark" content="">  __unique-mark__]
    `)
  })

  it('init C with partial placeholder', async () => {
    writeFileSync('test.log', 'console.log("hello shuutils !");\n// unique-mark')
    const result = await init('test.{log}')
    expect(result.value).toMatchInlineSnapshot(`"injected 0 mark in 1 file"`)
  })

  it('init D with full placeholder', async () => {
    writeFileSync('test.log', 'console.log("hello shuutils __unique-mark__ !");')
    const before = readFileSync('test.log', 'utf8')
    expect(before.includes('__unique-mark__')).toBe(true)
    const result = await init('test.{log}')
    expect(result.value).toMatchInlineSnapshot(`"injected 1 mark in 1 file"`)
    const after = readFileSync('test.log', 'utf8')
    expect(after.includes('__unique-mark__')).toBe(false)
  })

  it('init E returns error when getTargetFiles returns no files', async () => {
    // This will trigger the branch where getTargetFiles returns error for no files found
    await expect(init('no-such-file.{js}')).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: no file found for target "no-such-file.{js}", aborting.]`)
  })

  it('init F returns error when getPackageJsonVersion returns error', async () => {
    // Temporarily rename package.json to simulate missing file
    const pkgPath = path.join(process.cwd(), 'package.json')
    const tempPath = path.join(process.cwd(), 'package.json.bak')
    if (existsSync(pkgPath)) renameSync(pkgPath, tempPath)
    try {
      await expect(init('test.{log}')).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: package.json was not found in ${pkgPath}, aborting.]`)
    } finally {
      if (existsSync(tempPath)) renameSync(tempPath, pkgPath)
    }
  })

  it('init G logs success for multiple files and marks', async () => {
    // Create two files with the placeholder
    writeFileSync('test1.log', 'console.log("__unique-mark__");')
    writeFileSync('test2.log', 'console.log("__unique-mark__");')
    const result = await init('test{1,2}.{log}')
    expect(result.value).toMatchInlineSnapshot(`"injected 2 marks in 2 files"`)
    // Clean up
    if (existsSync('test1.log')) unlinkSync('test1.log')
    if (existsSync('test2.log')) unlinkSync('test2.log')
  })
})
