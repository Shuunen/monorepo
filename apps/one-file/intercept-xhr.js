/* c8 ignore start */
// oxlint-disable no-console, no-magic-numbers, no-undef, prefer-rest-params, no-extend-native
const lastRequest = { method: '', url: '' }

// biome-ignore lint/style/useNamingConvention: it's a Class
const OldXHR = globalThis.XMLHttpRequest

function XhrProxy() {
  const instance = new OldXHR()
  instance.addEventListener(
    'readystatechange',
    () => {
      // biome-ignore lint/suspicious/noConsole: old POC
      if (instance.readyState === 4 && instance.status !== 200) console.log(`HTTP Error ${instance.status} on ${lastRequest.method} ${lastRequest.url}`)
    },
    false,
  )
  return instance
}

const originalOpen = OldXHR.prototype.open
OldXHR.prototype.open = function openProxy(/** @type {string} */ method, /** @type {string} */ url) {
  lastRequest.method = method
  lastRequest.url = url
  // biome-ignore lint/complexity/noArguments: old POC
  return originalOpen.apply(this, Array.prototype.slice.call(arguments))
}

globalThis.XMLHttpRequest = XhrProxy

export const amazing = true
