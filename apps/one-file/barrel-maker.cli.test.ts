import { alignForSnap, Result } from '@monorepo/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFiles = ['atoms/Button.tsx', 'atoms/types.ts', 'icons/Icon.tsx', 'molecules/Card.tsx', 'molecules/Card.stories.tsx']

describe('barrel-maker cli', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doMock('tiny-glob', () => ({ default: vi.fn().mockResolvedValue(mockFiles) }))
    vi.doMock('node:fs', () => ({ writeFileSync: vi.fn() }))
  })

  it('make A ext empty and default index.ts', async () => {
    const { make } = await import('./barrel-maker.cli')
    const { value } = await make({ avoid: '.stories.', ext: '', target: './{atoms,icons,molecules}/*.tsx' })
    expect(value.content).toMatchSnapshot()
    expect(value.files).toMatchSnapshot()
    expect(alignForSnap(value.out)).toContain(`apps/one-file/index.ts`)
  })

  it('make B index.js and ext .js', async () => {
    const { make } = await import('./barrel-maker.cli')
    const { value } = await make({ avoid: '.test.ts', ext: '.js', index: 'index.js', target: './lib/*.ts' })
    expect(value.content).toMatchSnapshot()
    expect(value.files).toMatchSnapshot()
    expect(alignForSnap(value.out)).toContain(`apps/one-file/index.js`)
  })

  it('make C undefined ext', async () => {
    const { make } = await import('./barrel-maker.cli')
    const { value } = await make({ avoid: '.stories.', ext: undefined, target: './{atoms,icons,molecules}/*.tsx' })
    expect(value.content).toMatchSnapshot()
    expect(value.files).toMatchSnapshot()
    expect(alignForSnap(value.out)).toContain(`apps/one-file/index.ts`)
  })

  it('main A empty args', async () => {
    const { main } = await import('./barrel-maker.cli')
    const { error } = Result.unwrap(await main(['node', 'script.ts']))
    expect(error).toMatchInlineSnapshot(`"missing target argument"`)
  })

  it('main B with args', async () => {
    const { main } = await import('./barrel-maker.cli')
    const { value } = Result.unwrap(await main(['node', 'script.ts', '--target=./{atoms,icons,molecules}/*.tsx', '--avoid=.stories.', '--ext=.js', '--index=index.js']))
    expect(value?.content).toMatchSnapshot()
    expect(value?.files).toMatchSnapshot()
    expect(alignForSnap(value?.out)).toContain(`apps/one-file/index.js`)
  })
})
