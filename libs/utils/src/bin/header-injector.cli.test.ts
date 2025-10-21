import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('tiny-glob')
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

const glob = await import('tiny-glob')
const fs = await import('node:fs')
const mod = await import('./header-injector.cli.js')

function mockFileContent(path: string): string {
  if (path === 'a.ts') return '/* HEADER */\nconsole.log(1)'
  return 'console.log(2)'
}

describe('header-injector.cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('main A should return error when missing header argument', async () => {
    const result = await mod.main(['node', 'script'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatchInlineSnapshot('"missing header argument"')
  })

  it('main B should inject header into files without header', async () => {
    vi.mocked(glob.default).mockResolvedValue(['a.ts', 'b.ts'])
    vi.mocked(fs.readFileSync).mockImplementation((...args: unknown[]) => mockFileContent(args[0] as string))
    const writeSpy = vi.mocked(fs.writeFileSync)
    const result = await mod.main(['node', 'script', '--header=/* HEADER */'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const metrics = result.value
    expect(metrics.hasHeader, 'B hasHeader').toBe(1)
    expect(metrics.noHeader, 'B noHeader').toBe(1)
    expect(metrics.nbFixed, 'B nbFixed').toBe(1)
    expect(writeSpy).toHaveBeenCalledWith('b.ts', '/* HEADER */\nconsole.log(2)')
  })

  it('main C should count skipped when write fails', async () => {
    vi.mocked(glob.default).mockResolvedValue(['c.ts'])
    vi.mocked(fs.readFileSync).mockReturnValue('console.log(3)')
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error('disk full')
    })
    const result = await mod.main(['node', 'script', '--header=// NEW'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const metrics = result.value
    expect(metrics.noHeader, 'C noHeader').toBe(1)
    expect(metrics.nbFixed, 'C nbFixed').toBe(0)
    expect(metrics.readError, 'C readError').toBe(0)
    expect(metrics.writeError, 'C writeError').toBe(1)
  })

  it('main D should count readError when read fails', async () => {
    vi.mocked(glob.default).mockResolvedValue(['d.ts'])
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('permission denied')
    })
    const result = await mod.main(['node', 'script', '--header=// NEW'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const metrics = result.value
    expect(metrics.readError, 'D readError').toBe(1)
    expect(metrics.noHeader, 'D noHeader').toBe(0)
    expect(metrics.nbFixed, 'D nbFixed').toBe(0)
  })

  it('report A should generate correct report string', () => {
    const metrics = {
      hasHeader: 1,
      nbFixed: 2,
      noHeader: 3,
      readError: 4,
      writeError: 5,
    }
    const report = mod.report(metrics)
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files with header : [32m1[39m
        - Files without header : [33m3[39m
        - Files fixed : [32m2[39m
        - Files read errors : [31m4[39m
        - Files write errors : [31m5[39m"
    `)
  })

  it('report B should handle zero metrics gracefully', () => {
    const metrics = {
      hasHeader: 0,
      nbFixed: 0,
      noHeader: 0,
      readError: 0,
      writeError: 0,
    }
    const report = mod.report(metrics)
    expect(report).toMatchInlineSnapshot(`
      "Header Injector report :
        - Files with header : [90m0[39m
        - Files without header : [90m0[39m
        - Files fixed : [90m0[39m
        - Files read errors : [90m0[39m
        - Files write errors : [90m0[39m"
    `)
  })
})
