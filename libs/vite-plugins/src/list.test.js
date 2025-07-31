import * as fs from 'node:fs'
import glob from 'tiny-glob'
import { listEntries } from './list.cli'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

vi.mock('tiny-glob', () => ({
  default: vi.fn(),
}))

describe('list.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listEntries A glob matched some files', async () => {
    vi.mocked(glob).mockReturnValue(Promise.resolve(['lib/unique-mark.node.js', 'lib/some.test.js', 'lib/also.types.js']))

    await listEntries()

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0]

    const filePath = writeCall[0]

    const content = writeCall[1]

    expect(filePath).toContain('libs/vite-plugins/src/index.js')

    expect(content).toBe("export * from './lib/unique-mark.node.js'\nexport type * from './lib/also.types.js'\n")
  })
})
