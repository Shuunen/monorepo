// ==UserScript==
// @name         Laptop Helper
// @author       Romain Racamier-Lafon
// @description  Add annotations on displayed informations
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/laptop-helper.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/laptop-helper.user.js
// @grant        none
// @match        https://bestware.com/*
// @match        https://deals.dell.com/*
// @match        https://laptopmedia.com/*
// @match        https://noteb.com/*
// @match        https://www.amazon.com/*
// @match        https://www.amazon.fr/*
// @match        https://www.boulanger.com/*
// @match        https://www.comparez-malin.fr/*
// @match        https://www.darty.com/*
// @match        https://www.dealabs.com/*
// @match        https://www.dell.com/*
// @match        https://www.laptoparena.net/*
// @match        https://www.laptopspirit.fr/*
// @match        https://www.ldlc.com/*
// @match        https://www.lenovo.com/*
// @match        https://www.materiel.net/*
// @match        https://www.newegg.com/*
// @match        https://www.notebookcheck.net/*
// @match        https://www.topachat.com/*
// @match        https://www.tuxedocomputers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bestware.com
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @require      https://unpkg.com/rough-notation/lib/rough-notation.iife.js
// @version      1.0.3
// ==/UserScript==

// @ts-nocheck FIX ME later, I dont use Laptop Helper for now
// oxlint-disable no-magic-numbers
// oxlint-disable max-lines

function getColorForScore(percent) {
  const alpha = 30
  if (percent <= 35) return `hsl(0deg 100% 50% / ${alpha}%)` // red
  if (percent <= 50) return `hsl(35deg 100% 50% / ${alpha}%)` // orange
  if (percent <= 65) return `hsl(55deg 100% 50% / ${alpha}%)` // yellow
  return `hsl(120deg 100% 50% / ${alpha}%)` // green
}

function getScoresForRam(ram, score) {
  const scores = {}
  scores[`${ram}gb`] = score
  scores[`${ram}go`] = score
  scores[`${ram} gb`] = score
  scores[`${ram} go`] = score
  return scores
}

function getScoresForScreen(inches, score) {
  const scores = {}
  scores[`${inches} pouce`] = score
  scores[`${inches}"`] = score
  scores[`${String(inches).replace('.', ',')}"`] = score
  scores[`${inches}”`] = score
  scores[`${String(inches).replace('.', ',')}”`] = score
  scores[`${inches} inch`] = score
  scores[`${inches}in`] = score
  return scores
}

function getScoresForWifi(wifi, score) {
  const scores = {}
  scores[`wifi ${wifi}`] = score
  scores[`wifi${wifi}`] = score
  scores[`wi-fi ${wifi}`] = score
  return scores
}

function getScoreForRefresh(refresh, score) {
  const scores = {}
  scores[`${refresh}hz`] = score
  scores[`${refresh} hz`] = score
  return scores
}

function getScoreForResolution(resolution, score) {
  const scores = {}
  scores[`${resolution}p`] = score
  scores[`${resolution} p`] = score
  return scores
}

// oxlint-disable-next-line sort-keys
const scoresByKeyword = {
  ' tn ': 50,
  backlit: 70,
  fhd: 30,
  fingerprint: 70,
  'full hd': 30,
  gtx: 70,
  'keyboard light': 70,
  led: 70,
  lock: 70,
  nvme: 80,
  oled: 70,
  'power delivery': 70,
  rtx: 70,
  ssd: 70,
  ...getScoreForResolution('1080', 30),
  ...getScoreForResolution('1200', 60),
  ...getScoreForResolution('1440', 70),
  ...getScoreForResolution('1600', 70),
  ...getScoreForResolution('1800', 70),
  ...getScoreForResolution('2160', 70),
  ...getScoresForWifi(6, 70),
  ...getScoresForWifi('ax', 70),
  ...getScoresForWifi(5, 50),
  ...getScoresForWifi('ac', 50),
  ...getScoresForRam(16, 70),
  ...getScoresForRam(32, 70),
  ...getScoresForRam(8, 50),
  ...getScoresForScreen(12, 0),
  ...getScoresForScreen(13, 50),
  ...getScoresForScreen(13.4, 50),
  ...getScoresForScreen(13.6, 50),
  ...getScoresForScreen(14, 70),
  ...getScoresForScreen(15, 70),
  ...getScoresForScreen(15.6, 70),
  ...getScoresForScreen(16, 50),
  ...getScoresForScreen(17, 0),
  ...getScoresForScreen(17.3, 0),
  ...getScoreForRefresh(60, 0),
  ...getScoreForRefresh(75, 60),
  ...getScoreForRefresh(90, 70),
  ...getScoreForRefresh(120, 70),
  ...getScoreForRefresh(144, 70),
  ...getScoreForRefresh(165, 70),
  ...getScoreForRefresh(240, 70),
}

// oxlint-disable-next-line no-abusive-eslint-disable
/* oxlint-disable */
function b2a(a) {
  let c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    o,
    b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    k = 0,
    l = 0,
    m = '',
    n = []
  if (!a) return a
  do
    (c = a.charCodeAt(k++)),
      (d = a.charCodeAt(k++)),
      (e = a.charCodeAt(k++)),
      (j = (c << 16) | (d << 8) | e),
      (f = 63 & (j >> 18)),
      (g = 63 & (j >> 12)),
      (h = 63 & (j >> 6)),
      // biome-ignore lint/complexity/noCommaOperator: it's not my code
      (i = 63 & j),
      (n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i))
  while (k < a.length)
  // biome-ignore lint/suspicious/noAssignInExpressions: it's not my code
  // biome-ignore lint/complexity/noCommaOperator: it's not my code
  return (m = n.join('')), (o = a.length % 3), (o ? m.slice(0, o - 3) : m) + '==='.slice(o || 3)
}

function a2b(a) {
  let b,
    c,
    d,
    e = {},
    f = 0,
    g = 0,
    h = '',
    i = String.fromCharCode,
    j = a.length
  for (b = 0; 64 > b; b++) e['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(b)] = b
  // biome-ignore lint/suspicious/noAssignInExpressions: it's not my code
  for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & (f >>> (g -= 8))) || j - 2 > c) && (h += i(d))
  return h
}
/* oxlint-enable */

/**
 * Encode a string to base64
 * @param {string} string_ the string to encode
 * @returns {string} the encoded string
 */
function stringToBase64(string_) {
  return b2a(string_)
}

/**
 * Decode a base64 string
 * @param {string} string_ the string to decode
 * @returns {string} the decoded string
 */
function base64ToString(string_) {
  return a2b(string_)
}

// prepare cpu data
/**
 * Clean the CPU name
 * @param {string} name the CPU name to clean
 * @returns {string} the cleaned CPU name
 */
function cleanCpuName(name) {
  return name.replace(/amd|ryzen \d|core i\d-|gold|intel|pentium|pro|silver/giu, '').trim()
}

const data = `AMD Ryzen 3 5125C	3 %
AMD Ryzen 3 5300U	12 %
AMD Ryzen 3 5400U	11 %
AMD Ryzen 3 5425C	11 %
AMD Ryzen 3 5425U	12 %
AMD Ryzen 3 7320U	3 %
AMD Ryzen 3 Pro 5450U	9 %
AMD Ryzen 3 Pro 5475U	13 %
AMD Ryzen 5 4600H	17 %
AMD Ryzen 5 4680U	22 %
Amd Ryzen 5 5500U	26 %
Amd Ryzen 5 5500U	26 %
AMD Ryzen 5 5600H	22 %
AMD Ryzen 5 5600HS	23 %
AMD Ryzen 5 5600U	31 %
AMD Ryzen 5 5625C	20 %
AMD Ryzen 5 5625U	31 %
AMD Ryzen 5 6600H	33 %
AMD Ryzen 5 6600HS	38 %
AMD Ryzen 5 6600U	44 %
AMD Ryzen 5 7520U	3 %
AMD Ryzen 5 Pro 5650U	32 %
AMD Ryzen 5 Pro 5675U	24 %
AMD Ryzen 5 Pro 6650H	38 %
AMD Ryzen 5 Pro 6650HS	42 %
AMD Ryzen 5 Pro 6650U	37 %
AMD Ryzen 7 4800U	40 %
AMD Ryzen 7 4980U	47 %
AMD Ryzen 7 5700G	64 %
AMD Ryzen 7 5700U	38 %
AMD Ryzen 7 5800H	44 %
AMD Ryzen 7 5800HS	49 %
AMD Ryzen 7 5800U	55 %
AMD Ryzen 7 5825C	31 %
AMD Ryzen 7 5825U	48 %
AMD Ryzen 7 6800H	83 %
AMD Ryzen 7 6800HS	78 %
AMD Ryzen 7 6800U	87 %
AMD Ryzen 7 Pro 2700U 	7 %
AMD Ryzen 7 Pro 4750U	21 %
AMD Ryzen 7 Pro 5750G	53 %
AMD Ryzen 7 Pro 5850U	61 %
AMD Ryzen 7 Pro 5875U	70 %
AMD Ryzen 7 Pro 6850H	75 %
AMD Ryzen 7 Pro 6850HS	92 %
AMD Ryzen 7 Pro 6850U	87 %
AMD Ryzen 7 Pro 6860Z	96 %
AMD Ryzen 9 4900H	36 %
AMD Ryzen 9 4900HS	40 %
AMD Ryzen 9 5900HS	50 %
AMD Ryzen 9 5900HX	49 %
AMD Ryzen 9 5980HS	58 %
AMD Ryzen 9 5980HX	58 %
AMD Ryzen 9 6900HS	98 %
AMD Ryzen 9 6900HX	88 %
AMD Ryzen 9 6980HS	99 %
AMD Ryzen 9 6980HX	89 %
AMD Ryzen 9 Pro 6950H	88 %
AMD Ryzen 9 Pro 6950HS	98 %
Intel Core i3-1220P	21 %
Intel Core i5-10200H	3 %
Intel Core i5-10210U	4 %
Intel Core i5-10300H	18 %
Intel Core i5-11260H	5 %
Intel Core i5-11300H	26 %
Intel Core i5-1130G7	23 %
Intel Core i5-11320H	45 %
Intel Core i5-1135G7	27 %
Intel Core i5-11400H	6 %
Intel Core i5-1140G7	19 %
Intel Core i5-1145G7	31 %
Intel Core i5-11500H	13 %
Intel Core i5-1155G7	36 %
Intel Core i5-1230U	32 %
Intel Core i5-1235U	50 %
Intel Core i5-1240P	54 %
Intel Core i5-12450H	22 %
Intel Core i5-1245U	56 %
Intel Core i5-12500H	50 %
Intel Core i5-1250P	56 %
Intel Core i5-12600K	20 %
Intel Core i5-3317U	0 %
Intel Core i5-8350U	3 %
Intel Core i5-9600K	5 %
Intel Core i7-10510U	4 %
Intel Core i7-10610U	9 %
Intel Core i7-1065G7	8 %
Intel Core i7-10710U	5 %
Intel Core i7-10750H	6 %
Intel Core i7-10810U	11 %
Intel Core i7-10870H	8 %
Intel Core i7-11370H	44 %
Intel Core i7-11375H	53 %
Intel Core i7-11390H	52 %
Intel Core i7-11600H	11 %
Intel Core i7-1160G7	31 %
Intel Core i7-1165G7	43 %
Intel Core i7-11800H	17 %
Intel Core i7-1180G7	35 %
Intel Core i7-11850H	18 %
Intel Core i7-1185G7	50 %
Intel Core i7-1195G7	44 %
Intel Core i7-1250U	41 %
Intel Core i7-1255U	49 %
Intel Core i7-1260P	93 %
Intel Core i7-1260U	41 %
Intel Core i7-12650H	46 %
Intel Core i7-1265U	77 %
Intel Core i7-12700H	76 %
Intel Core i7-1270P	83 %
Intel Core i7-12800H	77 %
Intel Core i7-12800HX	77 %
Intel Core i7-1280P	96 %
Intel Core i7-12850HX	20 %
Intel Core i7-1370P	20 %
Intel Core i7-7820HQ	2 %
Intel Core i7-8705G	22 %
Intel Core i7-8706G	20 %
Intel Core i7-8850H	3 %
Intel Core i9-11900H	18 %
Intel Core i9-11950H	16 %
Intel Core i9-11980HK	18 %
Intel Core i9-12900H	82 %
Intel Core i9-12900HK	83 %
Intel Core i9-12900HX	21 %
Intel Core i9-12950HX	21 %
Intel Pentium Gold 7505	6 %
Intel Pentium Silver N6000	3 %`

for (const line of data.split('\n')) {
  const [cpuRaw, scoreRaw] = line.split('\t')
  const cpu = cleanCpuName(cpuRaw)
  const score = Number.parseInt(scoreRaw, 10)
  scoresByKeyword[cpu] = score
}

/**
 * Laptop Helper
 */
function LaptopHelper() {
  const utils = new Shuutils('lpt-hlp')
  const cls = {
    mark: `${utils.id}-mark`,
  }
  const selectors = {
    clearLinks: '.comparo_table_description a, .contenttable td a',
    desc: [
      'h1',
      '.specs > li',
      'dd',
      '.product_details_item',
      '.infos_strenghts > li',
      '.techSpecs-table td',
      '.cd-features-list > li',
      '.no-checkbox',
      '.checkbox > a',
      '.ProductShowcase__title__SBCBw',
      'h1 + .a-unordered-list > li > span.a-list-item',
      '.configuratorItem-mtmTable-description',
      '.text-start label',
      '.see-more > div > span',
      '.tech-spec-content',
      '.sd-ps-spec-item > div',
      '.userHtml',
      '.ps-iconography-specs-label',
      '.c-product__description',
      '.wp-block-table td',
      '.keypoints__item',
      '.comparo_table_description',
      '.search tr > td',
      '.secondary-title',
      '.description p',
      'p > strong',
      '.prodDetAttrValue',
      '.v-list-item[role="listitem"]',
      '.value > p',
      '.contenttable td',
      '.td-spec > span',
      '.prod_details > li',
      '.specs_details',
      '.product-item-short-specs > p',
      '.resulspace',
      '.colorTipContent',
      '.desc',
      '.short_desc',
      'div[data-asin] span.a-text-normal',
      '.c-product__title',
      '.pdt-info .title-3 a',
      '.thread-title--list',
      'article .libelle h3',
    ]
      .map(sel => `${sel}:not(.${cls.mark})`)
      .join(','),
  }
  const keywords = Object.keys(scoresByKeyword)
  utils.log(keywords.length, 'keywords with associated scores')
  const keywordRegex = new RegExp(keywords.join('|'), 'giu')

  /**
   * Annotate an element with a score
   * @param {HTMLElement} element - The element to annotate
   * @returns {void}
   */
  // oxlint-disable-next-line max-lines-per-function, consistent-return
  function annotate(element) {
    let { keyword } = element.dataset
    keyword = scoresByKeyword[keyword] === undefined ? keyword.toLowerCase() : keyword
    const score = scoresByKeyword[keyword]
    if (score === undefined) return utils.error('no score found for', keyword)
    utils.log('found score', score, 'for', keyword)
    element.dataset.score = score
    element.title = `Score : ${score}%`
    const color = getColorForScore(score)
    // @ts-expect-error RoughNotation is a global variable
    // oxlint-disable no-undef
    // biome-ignore lint/correctness/noUndeclaredVariables: it's a global var
    let annotation = RoughNotation.annotate(element, { color, type: 'highlight' })
    annotation.show()
    if (score >= 80) {
      // @ts-expect-error RoughNotation is a global variable
      // biome-ignore lint/correctness/noUndeclaredVariables: it's a global var
      annotation = RoughNotation.annotate(element.parentElement, { color: 'darkgreen', type: 'bracket' })
      annotation.show()
    }
  }
  /**
   * Check items on the page
   */
  function checkItems() {
    for (const descElement of utils.findAll(selectors.desc, document, true)) {
      descElement.classList.add(cls.mark)
      descElement.innerHTML = descElement.innerHTML.replace(/&nbsp;/gu, '')
      const text = utils.readableString(descElement.textContent).toLowerCase().trim()
      utils.log('checking :', text)
      descElement.innerHTML = descElement.innerHTML.replace(keywordRegex, match => `<span class="${cls.mark}" style="display: inline-block" data-keyword="${match.replace('"', '”')}">${match}</span>`)
      for (const markElement of utils.findAll(`.${cls.mark}`, descElement, true)) annotate(markElement)
    }
  }
  /**
   * Clear links
   */
  function clearLinks() {
    for (const link of utils.findAll(selectors.clearLinks, document, true)) {
      if (typeof link.href !== 'string' || link.href.length < 2) continue
      link.dataset.url = stringToBase64(link.href)
      link.href = '#'
      link.parentElement.addEventListener('mouseup', event => {
        if (event.button !== 1) return
        event.preventDefault()
        globalThis.open(base64ToString(link.dataset.url), '_blank')
      })
      link.removeAttribute('title')
    }
  }
  /**
   * Process the page
   */
  function process() {
    utils.log('processing')
    clearLinks()
    checkItems()
  }
  const processDebounced = utils.debounce(process, 500)
  document.addEventListener('scroll', processDebounced)
  utils.onPageChange(processDebounced)
  setTimeout(processDebounced, 1000)
}

if (globalThis.window) LaptopHelper()
else module.exports = { a2b, b2a, base64ToString, cleanCpuName, getColorForScore, getScoreForRefresh, getScoreForResolution, getScoresForRam, getScoresForScreen, getScoresForWifi, stringToBase64 }
