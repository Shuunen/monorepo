import * as fs from 'node:fs'
import path from 'node:path'
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
    const [filePath, content] = vi.mocked(fs.writeFileSync).mock.calls[0]
    expect(filePath.replaceAll(path.sep, '/')).toContain('libs/vite-plugins/src/index.js')
    expect(content.replaceAll(path.sep, '/')).toBe("export * from './lib/unique-mark.node.js'\nexport type * from './lib/also.types.js'\n")
  })
})
