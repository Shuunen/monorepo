import { hasOption } from './flags.js'

// oxlint-disable-next-line prefer-structured-clone
const initialProcess = JSON.parse(JSON.stringify(process))

describe('flags', () => {
  afterEach(() => {
    process.argv = initialProcess.argv
    process.env = initialProcess.env
  })

  it('hasOption A has process', () => {
    expect(typeof process).toMatchInlineSnapshot(`"object"`)
  })

  it('hasOption B without argv & without env', () => {
    // @ts-expect-error type issue
    process.argv = undefined
    // @ts-expect-error type issue
    process.env = undefined
    expect(hasOption('verbose')).toMatchInlineSnapshot(`false`)
  })

  it('hasOption C with argv & without env', () => {
    process.argv = ['--verbose']
    // @ts-expect-error type issue
    process.env = undefined
    expect(hasOption('verbose')).toMatchInlineSnapshot(`true`)
  })

  it('hasOption D without argv & with env', () => {
    process.argv = []
    process.env = { verbose: 'true' }
    expect(hasOption('verbose')).toMatchInlineSnapshot(`true`)
  })
})
