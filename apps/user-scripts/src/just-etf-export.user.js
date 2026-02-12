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

/*


Frais p.a.
ISIN
Réplication
Distribution
Monnaie fonds
Développement durable
Positions
1A en %
3A en %
5A en %
Rend./Risque 1A
Rend./Risque 3A
Rend./Risque 5A
Ticker
*/

const expectedHeaders = [
  "Nom du fonds",
  "Monnaie fonds",
  "Frais p.a.",
  "1A en %",
  "3A en %",
  "5A en %",
  "Rend./Risque 1A",
  "Rend./Risque 3A",
  "Rend./Risque 5A",
  "Distribution",
  "Positions",
  "Replication",
  "ISIN",
  "Ticker",
];

/**
 * @typedef {import('./just-etf-export.types').JustEtfExportData} JustEtfExportData
 */

function JustEtfExport() {
  /* globals Shuutils, RoughNotation */
  const utils = new Shuutils("just-etf-export", true);
  const marker = `${utils.id}-marker`;
  const selectors = {
    cells: "td",
    columnSelector: ".buttons-collection.buttons-colvis",
    columnToggle: ".buttons-columnVisibility",
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
  /**
   * Extract table cell data
   * @param {string} name - cell name or identifier
   * @param {Element} cell - table cell element
   * @returns {string} extracted text content
   */
  function extractCellData(name, cell) {
    if (!cell) {
      utils.error("Cell not found", { cell, name });
      return "";
    }
    const text = cell.innerHTML.replaceAll("<br>", " ").trim();
    utils.log("extracted cell data", { cell, name, text });
    return text;
  }
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
      currency: extractCellData("currency", cells[2]),
      distribution: extractCellData("distribution", cells[10]),
      fees: extractCellData("fees", cells[3]),
      fundName: fundNameLink.textContent.trim(),
      fundUrl: fundNameLink.href,
      isin: extractCellData("isin", cells[13]),
      perf1y: extractCellData("perf1y", cells[4]),
      perf3y: extractCellData("perf3y", cells[5]),
      perf5y: extractCellData("perf5y", cells[6]),
      perfRisk1y: extractCellData("perfRisk1y", cells[7]),
      perfRisk3y: extractCellData("perfRisk3y", cells[8]),
      perfRisk5y: extractCellData("perfRisk5y", cells[9]),
      positions: extractCellData("positions", cells[11]),
      replication: extractCellData("replication", cells[12]),
      ticker: extractCellData("ticker", cells[14]),
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
   * Check table headers to ensure correct page structure
   */
  function checkTableHeaders() {
    const headerCells = document.querySelectorAll(`${selectors.table} thead tr th`);
    const actualHeaders = Array.from(headerCells).map(cell => cell.textContent.trim());
    const headersMatch = expectedHeaders.every((header, index) => header === actualHeaders[index]);
    if (!headersMatch) {
      utils.error("Table headers do not match expected structure", { actualHeaders, expectedHeaders });
      utils.showError("Table structure has changed or you did not selected the correct columns");
    }
  }

  /**
   * Check table columns visibility to ensure correct data extraction
   */
  function checkTableColumns() {
    const columnSelector = utils.findOne(selectors.columnSelector);
    if (!columnSelector) {
      utils.showError("Column selector not found, the page structure might have changed");
      return;
    }
    columnSelector.click();
    const toggles = utils.findAll(selectors.columnToggle);
    if (toggles.length === 0) {
      utils.showError("Column toggles not found, the page structure might have changed");
      return;
    }
    for (const toggle of toggles) {
      const columnName = toggle.textContent.trim();
      if (columnName === "Rend./Risque 1A" && !toggle.classList.contains("active")) {
        utils.log("Activating column", { columnName });
        toggle.click();
      }
    }
  }

  /**
   * Process the page
   */
  function start() {
    utils.log("starting processing");
    const table = utils.findOne(selectors.table);
    if (!table) {
      utils.log("Table not found, skipping processing");
      return;
    }
    if (table.classList.contains(marker)) return;
    table.classList.add(marker);
    checkTableColumns();
    checkTableHeaders();
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
