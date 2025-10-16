import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { copyToClipboard, readClipboard } from './browser-clipboard.js'
import { sleep } from './sleep.js'

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register()

it('copyToClipboard A no clipboard in test env', async () => {
  const result = await copyToClipboard('hello')
  if (result.ok)
    expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": "copied to clipboard : hello",
    }
    `)
  else
    expect(result).toMatchInlineSnapshot(`
    Err {
      "error": "clipboard not available",
      "ok": false,
    }
  `)
})

it('copyToClipboard B un-stringifyable data', async () => {
  const objectThatCannotBeStringified = {
    // biome-ignore lint/style/useNamingConvention: cannot be changed
    toJSON: () => {
      throw new Error('cannot be stringified')
    },
  }
  const result = await copyToClipboard(objectThatCannotBeStringified)
  expect(result).toMatchInlineSnapshot(`
    Err {
      "error": "failed to stringify the data",
      "ok": false,
    }
  `)
})

it('copyToClipboard C with willLog', async () => {
  // Patch navigator.clipboard
  const originalClipboard = globalThis.navigator?.clipboard
  const mockClipboard = {
    writeText: vi.fn(() => undefined),
  }
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: mockClipboard,
  })
  const spy = vi.spyOn(console, 'log').mockImplementation(() => ({}))
  const result = await copyToClipboard('log this', true)
  expect(result.ok).toBe(true)
  expect(mockClipboard.writeText).toHaveBeenCalledWith('log this')
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('copying to clipboard'))
  spy.mockRestore()
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: originalClipboard,
  })
})

it('readClipboard A no clipboard in test env', async () => {
  const result = await readClipboard()
  if (result.ok)
    expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": "hello",
    }
    `)
  else
    expect(result).toMatchInlineSnapshot(`
    Err {
      "error": "clipboard not available",
      "ok": false,
    }
  `)
})

it('readClipboard B mocked clipboard', async () => {
  const clipboard = {
    readText: async () => {
      await sleep(10)
      return 'hello there !'
    },
  }
  // @ts-expect-error mocked clipboard
  const result = await readClipboard(false, clipboard)
  expect(result).toMatchInlineSnapshot(`
    Ok {
      "ok": true,
      "value": "hello there !",
    }
  `)
})

it('readClipboard C with willLog', async () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => ({}))
  const clipboard = {
    readText: () => 'logged text',
  }
  // @ts-expect-error mocked clipboard
  const result = await readClipboard(true, clipboard)
  expect(result.ok).toBe(true)
  if (result.ok) expect(result.value).toBe('logged text')
  expect(spy).toHaveBeenCalledWith('reading clipboard...')
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('got this text from clipboard'))
  spy.mockRestore()
})
