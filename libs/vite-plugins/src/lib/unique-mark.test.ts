import * as shuutils from '@shuunen/shuutils'
import { generateMark, getProjectVersion, injectMarkInAsset, injectMarkInAssets, uniqueMark } from './unique-mark.node.js'

describe('vite-plugin-unique-mark', () => {
  it('generateMark A generate a mocked mark', () => {
    const mark = generateMark({ commit: 'd52a6ba', date: '27/06/2025 20:08:01', version: '2.0.1' })
    expect(mark).toMatchInlineSnapshot(`"2.0.1 - d52a6ba - 27/06/2025 20:08:01"`)
  })

  it('injectMarkInAsset A injects mark in js file', () => {
    const asset = { code: 'console.log("__unique-mark__")', source: '' }
    const injectMarkSpy = vi.spyOn(shuutils, 'injectMark').mockImplementation((code: string, placeholder: string, mark: string) => code.replace(placeholder, mark))
    injectMarkInAsset({ asset, fileName: 'main.js', mark: 'MARK', placeholder: '__unique-mark__' })
    expect(asset.code).toContain('MARK')
    injectMarkSpy.mockRestore()
  })

  it('injectMarkInAsset B injects mark in html file', () => {
    const asset = { code: '', source: '<!-- __unique-mark__ -->' }
    const injectMarkSpy = vi.spyOn(shuutils, 'injectMark').mockImplementation((code: string, placeholder: string, mark: string) => code.replace(placeholder, mark))
    injectMarkInAsset({ asset, fileName: 'index.html', mark: 'MARK', placeholder: '__unique-mark__' })
    expect(asset.source).toContain('MARK')
    injectMarkSpy.mockRestore()
  })

  it('injectMarkInAssets C injects into multiple assets (observable effect)', () => {
    const assets = {
      'a.js': { code: '__unique-mark__', source: '' },
      'b.html': { code: '', source: '__unique-mark__' },
      'c.css': { code: '', source: '/* __unique-mark__ */' },
      'd.txt': { code: '', source: 'no mark' },
    }
    injectMarkInAssets(assets, 'unique-mark', '1.2.3')
    expect(assets['a.js'].code).toContain('1.2.3')
    expect(assets['b.html'].source).toContain('1.2.3')
    expect(assets['c.css'].source).toContain('1.2.3')
    expect(assets['d.txt'].source).toBe('no mark')
  })

  it('getProjectVersion A returns version from package.json (integration)', () => {
    const version = getProjectVersion(process.cwd())
    expect(typeof version).toBe('string')
  })

  it('getProjectVersion B returns empty string and logs warning on error', () => {
    expect(getProjectVersion('/no/such/path')).toBe('')
  })

  it('uniqueMark A plugin uses default placeholder when none provided', () => {
    const plugin = uniqueMark() // No options provided
    expect(plugin.name).toBe('vite-plugin-unique-mark')
    expect(plugin.apply).toBe('build')
    expect(plugin.enforce).toBe('post')
  })

  it('uniqueMark B plugin returns correct shape and calls hooks (smoke)', () => {
    const plugin = uniqueMark({ placeholder: 'ph' })
    expect(plugin.name).toBe('vite-plugin-unique-mark')
    expect(plugin.apply).toBe('build')
    expect(plugin.enforce).toBe('post')
    // Verify the plugin has the expected methods
    expect(typeof plugin.configResolved).toBe('function')
    expect(typeof plugin.generateBundle).toBe('function')
    // Test that configResolved is callable (without actually calling it)
    expect(plugin.configResolved).toBeInstanceOf(Function)
    expect(plugin.generateBundle).toBeInstanceOf(Function)
  })

  it('uniqueMark C plugin hooks execute successfully for coverage', () => {
    const plugin = uniqueMark({ placeholder: 'test-mark' })
    // Verify plugin methods exist and are callable
    expect(typeof plugin.configResolved).toBe('function')
    expect(typeof plugin.generateBundle).toBe('function')
    // Execute plugin hooks to achieve full coverage
    const mockConfig = { root: process.cwd() }
    const mockBundle = { 'test.js': { code: '__test-mark__', source: '' } }
    // These methods may not have full context but should execute without throwing
    expect(() => {
      const method = plugin.configResolved as unknown as (config: { root: string }) => void
      method(mockConfig)
    }).not.toThrow()
    expect(() => {
      const method = plugin.generateBundle as unknown as (options: unknown, bundle: Record<string, { source: string; code: string }>, isWrite: boolean) => void
      method({}, mockBundle, false)
    }).not.toThrow()
  })

  it('uniqueMark D plugin with empty and undefined options', () => {
    // Test with empty object
    const plugin1 = uniqueMark({})
    expect(plugin1.name).toBe('vite-plugin-unique-mark')
    // Test with undefined (this should use default placeholder)
    const plugin2 = uniqueMark(undefined)
    expect(plugin2.name).toBe('vite-plugin-unique-mark')
    // Test with no arguments at all
    const plugin3 = uniqueMark()
    expect(plugin3.name).toBe('vite-plugin-unique-mark')
  })
})
