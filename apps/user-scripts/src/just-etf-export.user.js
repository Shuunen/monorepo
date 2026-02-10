// ==UserScript==
// @name         JustETF Export - Get data with you
// @author       Shuunen
// @description  This script help me improve my JustETF user experience
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/just-etf-export.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/just-etf-export.user.js
// @grant        none
// @match        https://www.justetf.com/fr/search.html?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=justetf.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.0.0
// ==/UserScript==

function JustEtfExport() {
  /* globals Shuutils, RoughNotation */
  const utils = new Shuutils("just-etf-export", true);
  const processed = `${utils.id}-processed`;
  const selectors = {
    labels: `td > div > img + div[title]:not(.${processed})`,
  };
  /**
   * Process the page
   */
  function start() {
    utils.log("starting processing", { selectors });
  }
  const startDebounceTime = 500;
  const startDebounced = utils.debounce(start, startDebounceTime);
  document.addEventListener("scroll", () => startDebounced());
  utils.onPageChange(startDebounced);
  setTimeout(startDebounced, startDebounceTime);
}

if (globalThis.window) JustEtfExport();
