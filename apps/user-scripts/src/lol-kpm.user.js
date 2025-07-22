// ==UserScript==
// @name         LoL - KPM Counter - Kills per minutes
// @author       Romain Racamier-Lafon
// @description  Show how many kills per minutes you did, isn't the title that obvious ?
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/lol-kpm.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/lol-kpm.user.js
// @grant        none
// @match        https://matchhistory.euw.leagueoflegends.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leagueoflegends.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.1.5
// ==/UserScript==

/* eslint-disable jsdoc/require-jsdoc */

function LolKpm() {
  const utils = new Shuutils('lol-kpm')
  const maxKpm = 1.8
  /**
   * Calculates the percentage representation of the given KPM (kills per minute)
   * value relative to the maximum KPM, clamped between 0 and 100.
   *
   * @param {number} kpm - The kills per minute value to convert to a percentage.
   * @returns {number} The percentage value (0-100) representing the KPM.
   */
  function coolPercents(kpm) {
    // eslint-disable-next-line no-magic-numbers
    return Math.min(Math.max(Math.round((kpm / maxKpm) * 100), 0), 100)
  }
  /**
   * Calculates and displays the kills per minute (KPM) for a given row element,
   * appends the result as a styled div, and marks the row as handled.
   *
   * Extracts the number of kills and match duration from the row's child elements,
   * computes the KPM, and uses the `coolPercents` function to determine a "score".
   * The KPM and score are displayed with dynamic styling and a tooltip.
   *
   * @param {HTMLElement} row - The table row element containing match data.
   */
  function showKpmOnRow(row) {
    const kdaPlate = row.querySelector('.kda-plate')
    if (!kdaPlate || !kdaPlate.textContent) {
      utils.showError('Could not find .kda-plate or its text content')
      return
    }
    const kills = Number.parseInt(kdaPlate.textContent.split('/')[0], 10)
    const dateDuration = row.querySelector('.date-duration')
    if (!dateDuration || !dateDuration.textContent) {
      utils.showError('Could not find .date-duration or its text content')
      return
    }
    const time = dateDuration.textContent
      .split(' ')[0]
      .split(':')
      .map(string => Number.parseInt(string, 10))
    // eslint-disable-next-line no-magic-numbers
    const minutes = time.length === 3 ? 60 * time[0] + time[1] : time[0]
    const element = document.createElement('div')
    // eslint-disable-next-line no-magic-numbers
    const kpm = Math.round((kills / minutes) * 10) / 10
    const score = coolPercents(kpm) // 5% ur bad, 100% super good
    element.textContent = `${kpm} kills/min`
    element.title = `You're ${score}% awesome`
    // eslint-disable-next-line no-magic-numbers
    element.style = `white-space: nowrap; padding-right: 15px; font-size: ${kpm * 10 + 5}px; color: hsl(120, 100%, ${score}%); background-color: hsl(0, 0%, ${100 - score}%);`
    row.append(element)
    row.classList.add('kpm-handled')
  }
  globalThis.addEventListener('DOMNodeInserted', event => {
    const node = event.target
    if (!(node instanceof HTMLElement) || !node.matches('ul[id^=match-history]')) return
    const rows = utils.findAll('div[id^=game-summary]:not(.kpm-handled)', node, true)
    for (const row of rows) showKpmOnRow(row)
  })
}

if (globalThis.window) LolKpm()
else module.exports = {}
