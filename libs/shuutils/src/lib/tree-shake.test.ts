import { build as esbuild } from 'esbuild'

const currentDirectory = import.meta.dirname

/**
 * Align the content of a file for snapshot testing
 * @param content the content of the file
 * @returns {string} the content of the file cleaned up for snapshot testing
 */
function alignForSnap(content: string) {
  return (
    content
      // clear the hash from the file name
      .replace(/(?<name>[a-z]{3,30})-[a-z\d]+(?<ext>\.js)/giu, '$<name>$<ext>')
      // align the location of the imports
      .replaceAll('libs/shuutils/', '')
  )
}

/**
 * Build a file using esbuild
 * @param contents the contents of the file
 * @returns {Promise<{ errors: import('esbuild').Message[], nbOutputFiles: number, output: string, warnings: import('esbuild').Message[] }>} the result of the build
 */
async function build(contents: string) {
  const result = await esbuild({
    bundle: true,
    format: 'esm',
    minify: false,
    platform: 'node',
    stdin: { contents, resolveDir: currentDirectory },
    write: false,
  })
  return `
  ${result.outputFiles.length} files built

  ${result.warnings.length} warnings
  ${result.warnings.map(warning => warning.text).join('\n')}
  ${result.errors.length} errors
  ${result.errors.map(error => error.text).join('\n')}
  ╔══════════════════════════╗
  ║  Input start             ║
  ╚══════════════════════════╝
  ${contents.trim()}
  ╔══════════════════════════╗
  ║  Input end, output start ║
  ╚══════════════════════════╝
  ${alignForSnap(result.outputFiles[0]?.text ?? '').trim()}
  ╔══════════════════════════╗
  ║  Output end              ║
  ╚══════════════════════════╝`
}

it('tree-shake test A', async () => {
  const result = await build(`import { randomNumber } from '../index.ts'
  console.log('tree-shaking test A, only using randomNumber', randomNumber(1, 10))`)
  expect(result).toMatchSnapshot()
})

it('tree-shake test B', async () => {
  const result = await build(`import { randomNumber, randomString } from '../index.ts'
  console.log('tree-shaking test B, using randomNumber and randomString', randomNumber(1, 10), randomString(10))`)
  expect(result).toMatchSnapshot()
})

it('tree-shake test C', async () => {
  const result = await build(`import { readableTimeAgo } from '../index.ts'
  console.log('tree-shaking test C, only using readableTimeAgo', readableTimeAgo())`)
  expect(result).toMatchSnapshot()
})

it('tree-shake test D', async () => {
  const result = await build(`import { toastSuccess } from '../index.ts'
  console.log('tree-shaking test D, using toastSuccess', toastSuccess('my message'))`)
  expect(result).toMatchSnapshot()
})
