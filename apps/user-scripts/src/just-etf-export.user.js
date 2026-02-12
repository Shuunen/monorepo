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

// oxlint-disable no-magic-numbers

/* TODO :
- Add export button to export data as CSV to clipboard
- Check column headers to be sure we are on the right page with the right table structure
*/

/**
 * @typedef {import('./just-etf-export.types').JustEtfExportData} JustEtfExportData
 */

function JustEtfExport() {
  /* globals Shuutils, RoughNotation */
  const utils = new Shuutils("just-etf-export", true);
  const selectors = {
    cells: "td",
    currency: "td:nth-child(3)",
    distribution: "td:nth-child(11)",
    fees: "td:nth-child(4)",
    fundName: "td:nth-child(2) a.link",
    isin: "td:nth-child(14)",
    perf1y: "td:nth-child(5)",
    perf3y: "td:nth-child(6)",
    perf5y: "td:nth-child(7)",
    positions: "td:nth-child(12)",
    replication: "td:nth-child(13)",
    risk1y: "td:nth-child(8)",
    risk3y: "td:nth-child(9)",
    risk5y: "td:nth-child(10)",
    rows: "table#etfsTable tbody tr",
    table: "table#etfsTable",
    ticker: "td:nth-child(15)",
  };
  const extractors = {
    percent: (/** @type {Element} */ cell) => cell.textContent.trim(),
    text: (/** @type {Element} */ cell) => cell.innerHTML.replaceAll("<br>", " ").trim(),
  };
  /**
   * Extract table row data
   * @param {Element} row - table row element
   * @returns {JustEtfExportData | undefined} extracted data or undefined if extraction failed
   */
  function extractRowData(row) {
    /** @type {HTMLAnchorElement | null} */
    const fundNameLink = row.querySelector(selectors.fundName);
    if (!fundNameLink) return;
    const cells = row.querySelectorAll(selectors.cells);
    return {
      currency: extractors.text(cells[2]),
      distribution: extractors.text(cells[10]),
      fees: extractors.text(cells[3]),
      fundName: fundNameLink.textContent.trim(),
      fundUrl: fundNameLink.href,
      isin: extractors.text(cells[13]),
      perf1y: extractors.percent(cells[4]),
      perf3y: extractors.percent(cells[5]),
      perf5y: extractors.percent(cells[6]),
      perfRisk1y: extractors.percent(cells[7]),
      perfRisk3y: extractors.percent(cells[8]),
      perfRisk5y: extractors.percent(cells[9]),
      positions: extractors.text(cells[11]),
      replication: extractors.text(cells[12]),
      ticker: extractors.text(cells[14]),
    };
  }
  /**
   * Extract table data
   * @returns {Array<object>} extracted data
   */
  function extractTableData() {
    const rows = document.querySelectorAll(selectors.rows);
    /** @type {Array<JustEtfExportData>} */
    const data = [];
    for (const row of rows) {
      const rowData = extractRowData(row);
      if (rowData) data.push(rowData);
    }
    return data;
  }
  /**
   * Process the page
   */
  function start() {
    utils.log("starting processing");
    const tableData = extractTableData();
    utils.log("extracted table data", { count: tableData.length, data: tableData });
  }
  const startDebounceTime = 500;
  const startDebounced = utils.debounce(start, startDebounceTime);
  document.addEventListener("scroll", () => startDebounced());
  utils.onPageChange(startDebounced);
  setTimeout(startDebounced, startDebounceTime);
}

if (globalThis.window) JustEtfExport();
