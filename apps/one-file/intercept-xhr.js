/* v8 ignore start -- @preserve */
// oxlint-disable no-console, no-magic-numbers, prefer-rest-params
const lastRequest = { method: "", url: "" };

// biome-ignore lint/style/useNamingConvention: it's a Class
const OldXHR = globalThis.XMLHttpRequest;

function XhrProxy() {
  const instance = new OldXHR();
  instance.addEventListener(
    "readystatechange",
    () => {
      if (instance.readyState === 4 && instance.status !== 200)
        // biome-ignore lint/suspicious/noConsole: old POC
        console.log(`HTTP Error ${instance.status} on ${lastRequest.method} ${lastRequest.url}`);
    },
    false,
  );
  return instance;
}

const originalOpen = OldXHR.prototype.open;
OldXHR.prototype.open = function openProxy(/** @type {string} */ method, /** @type {string} */ url) {
  lastRequest.method = method;
  lastRequest.url = url;
  // biome-ignore lint/complexity/noArguments: old POC
  return originalOpen.apply(this, Array.prototype.slice.call(arguments));
};

globalThis.XMLHttpRequest = XhrProxy;

export const amazing = true;
