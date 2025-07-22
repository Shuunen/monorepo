// ==UserScript==
// @name         Linxo AIO - Get data with you
// @description  This script help me improve my Linxo user experience
// @author       Shuunen
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/linxo-aio.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/linxo-aio.user.js
// @grant        none
// @match        https://wwws.linxo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linxo.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo/apps/user-scripts/src/utils.js
// @version      1.0.0
// ==/UserScript==

function LinxoAio() {
  /* globals Shuutils */
  /** @type {import('./utils.js').Shuutils} */
  const utils = new Shuutils('linxo-aio', true)
  utils.debug('Linxo AIO script started')
}

LinxoAio()
