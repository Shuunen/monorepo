// ==UserScript==
// @name         LeBonCoin Listing Plus Plus
// @author       Romain Racamier-Lafon
// @description  Show more infos on LeBonCoin listings
// @downloadURL  https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/lbc-listings.user.js
// @updateURL    https://github.com/Shuunen/monorepo/raw/master/apps/user-scripts/src/lbc-listings.user.js
// @grant        none
// @match        https://www.leboncoin.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=leboncoin.fr
// @namespace    https://github.com/Shuunen
// @require      https://cdn.jsdelivr.net/gh/Shuunen/monorepo@latest/apps/user-scripts/src/utils.js
// @version      1.0.7
// ==/UserScript==

// oxlint-disable max-lines

/**
 * @typedef {import('./lbc.types').LbcCustomInfo} LbcCustomInfo
 * @typedef {import('./lbc.types').LbcAdType} LbcAdType
 * @typedef {import('./lbc.types').LbcAd} LbcAd
 * @typedef {import('./lbc.types').LbcHousingAd} LbcHousingAd
 * @typedef {import('./lbc.types').LbcCarAd} LbcCarAd
 */

const scoreRules = { scoreMax: 2, scoreMin: 0 }
const priceRules = { ...scoreRules, isHigherBetter: false, valueMax: 12_000, valueMin: 6000 }
const mileageRules = { ...scoreRules, isHigherBetter: false, valueMax: 130_000, valueMin: 70_000 }
const nbMonths = 12
const nbPercents = 100
const yearRules = { ...scoreRules, isHigherBetter: true, valueMax: new Date().getFullYear(), valueMin: new Date().getFullYear() - nbMonths }

/* oxlint-disable no-magic-numbers */
// oxlint-disable-next-line sort-keys
const districts = {
  67218: 'Illkirch',
  100101: 'Illkirch nord',
  100102: 'Illkirch centre ouest',
  3001181: 'Neudorf centre',
  3001182: 'Neudorf-Musau-Port du Rhin',
  3001183: 'Meinau',
  3001184: 'Neuhof',
  3001187: 'Cathédrale',
  3001189: 'Robertsau',
  3001192: 'Les Halles',
  3001193: 'Tribunal',
  3001197: 'Esplanade - Université',
  3001199: 'Cronenbourg',
  3001201: 'Stockfeld',
  3001203: 'Petite France',
  3001211: 'Hautepierre',
}

const districtsToHide = new Set([
  districts[3_001_189], // Robertsau
  districts[3_001_192], // Les Halles
  districts[3_001_199], // Cronenbourg
  districts[3_001_211], // Hautepierre
])
/* oxlint-enable no-magic-numbers */

const citiesToHide = new Set(['Eschau'])

/**
 * Get square info from the ad
 * @param {LbcHousingAd} ad the ad to process
 * @returns {LbcCustomInfo} the custom info
 */
function getSquareInfo(ad) {
  const square = ad.attributes.find(attribute => attribute.key === 'square')
  const text = square ? `surface : ${square.value} m²` : ''
  return { text }
}

/**
 * Get rooms info from the ad
 * @param {LbcHousingAd} ad the ad to process
 * @returns {LbcCustomInfo} the custom info
 */
function getRoomsInfo(ad) {
  const rooms = ad.attributes.find(attribute => attribute.key === 'rooms')
  const text = rooms ? `${rooms.value} pièces` : ''
  return { text }
}

/**
 * Readable floor number
 * @param {string} floorNumber the floor number
 * @returns {string} the human readable floor number
 */
function humanReadableFloor(floorNumber) {
  if (floorNumber === '0') return 'étage : rdc'
  if (floorNumber === '1') return '1er étage'
  return `${floorNumber}e étage`
}

/**
 * Get elevator info from the ad
 * @param {LbcHousingAd} ad the ad to process
 * @returns {LbcCustomInfo} the custom info
 */
function getElevatorInfo(ad) {
  const elevator = ad.attributes.find(attribute => attribute.key === 'elevator')
  if (elevator === undefined) return {}
  // oxlint-disable-next-line no-nested-ternary
  const text = elevator.value === '1' ? 'ascenseur' : elevator.value === '2' ? "pas d'ascenseur" : `unknown elevator value "${elevator.value}"`
  const half = 0.5
  const score = elevator.value === '2' ? half : 1
  return { score, text }
}

/**
 * Get the ad type
 * @param {LbcAd} ad the ad to process
 * @returns {LbcAdType} the ad type
 */
function getAdType(ad) {
  const category = ad.category_id
  if (['2', '4', '5'].includes(category)) return 'car'
  return 'unknown'
}

function LbcListings() {
  const utils = new Shuutils('lbc-lpp')
  const cls = {
    marker: `${utils.id}-processed`,
  }

  // Remove me one day :)
  utils.tw ||= classes => classes.split(' ')

  /**
   * Get the ad element from the ad object
   * @param {LbcAd} ad the ad object
   * @returns {HTMLElement|undefined} the ad element
   */
  function getAdElement(ad) {
    const id = ad.list_id
    const link = document.querySelector(`[href*="${id}"]`)
    if (!link) {
      document.location.reload()
      return
    } // we need to have that next data in page
    const element = link.parentElement
    if (!element) {
      utils.error('no element found for link', link)
      return
    }
    if (element.classList.contains('hidden')) {
      utils.debug('ad is hidden', id)
      return
    }
    if (element.classList.contains(cls.marker)) {
      utils.debug('ad already processed', id)
      return
    }
    return element
  }

  /**
   * Get the DPE infos from the ad
   * @param {LbcHousingAd} ad the housing ad to process
   * @returns {LbcCustomInfo} the DPE infos
   */
  function getDpeInfos(ad) {
    const energy = ad.attributes.find(attribute => attribute.key === 'energy_rate')?.value ?? ''
    if (energy === '') utils.warn('no energy rate found in ad', ad)
    const ges = ad.attributes.find(attribute => attribute.key === 'ges')?.value ?? ''
    if (ges === '') utils.warn('no GES found in ad', ad)
    const text = `DPE : ${energy} / GES : ${ges}`
    // oxlint-disable-next-line no-nested-ternary, no-magic-numbers
    const score = ['A', 'B'].includes(energy) ? 1.5 : energy === 'C' ? 1 : 0.5
    return { score, text }
  }

  /**
   * Remove the native LBC viewed style from the ad picture
   * @param {HTMLElement} picture the picture element
   * @returns {void} nothing
   */
  function removePictureViewedStyle(picture) {
    const nbParents = 4
    let cursor = picture
    for (let index = 0; index < nbParents; index += 1) {
      const { parentElement } = cursor
      if (!parentElement) {
        utils.warn(`no parent found for picture at level ${index}`, picture)
        return
      }
      parentElement.style.opacity = '1'
      cursor = parentElement
    }
    picture.classList.add(cls.marker)
  }

  /**
   * Remove the native LBC viewed style from the ad paragraph
   * @param {HTMLElement} paragraph the paragraph element
   * @returns {void} nothing
   */
  function removeParagraphViewedStyle(paragraph) {
    paragraph.style.opacity = '1'
    paragraph.classList.add(...utils.tw('max-w-md'), cls.marker)
  }

  function removeViewedStyles() {
    const pictures = utils.findAll(`.${cls.marker} picture:not(.${cls.marker})`, document, true)
    for (const picture of pictures) removePictureViewedStyle(picture)
    const paragraphs = utils.findAll(`.${cls.marker} p:not(.${cls.marker})`, document, true)
    for (const paragraph of paragraphs) removeParagraphViewedStyle(paragraph)
  }

  /**
   * Add the ad id to the element
   * @param {LbcAd} ad the ad to process
   * @returns {void}
   */
  function addId(ad) {
    const line = document.createElement('div')
    line.textContent = ad.list_id.toString()
    line.classList.add(...utils.tw('absolute bottom-0 left-0 rounded-lg bg-white/50 text-gray-500'))
    ad.element.append(line)
  }

  /**
   * Get the ad location district
   * @param {LbcHousingAd} ad the ad to process
   * @returns {string} the district
   */
  function getDistrict(ad) {
    const districtId = ad.attributes.find(attribute => attribute.key === 'district_id')?.value
    if (districtId === undefined) return ''
    // @ts-expect-error type conversion from string to number
    return districts[districtId] ?? districtId
  }

  /**
   * Hide the ad element
   * @param {HTMLElement} element the element to hide
   * @param {string} cause the cause of the hide
   * @returns {void}
   */
  function hideAdElement(element, cause = 'unknown') {
    element.classList.add(...utils.tw('h-24 overflow-hidden opacity-50 grayscale transition-all duration-500 ease-in-out hover:h-[215px] hover:opacity-100 hover:filter-none'))
    element.parentElement?.classList.add(`${utils.id}-hidden`, `${utils.id}-hidden-cause-${cause}`)
  }

  /**
   * Get ad location info
   * @param {LbcHousingAd} ad the ad to process
   * @returns {LbcCustomInfo} the custom info
   */
  function getLocationInfo(ad) {
    const district = getDistrict(ad)
    const { city } = ad.location
    const shouldHide = citiesToHide.has(city) || districtsToHide.has(district)
    if (shouldHide) hideAdElement(ad.element, 'location')
    let text = city
    if (!city.includes(district)) text += ` - ${district}`
    // oxlint-disable-next-line no-magic-numbers
    const score = shouldHide ? 0.1 : 1
    return { score, text }
  }

  /**
   * Get the owner infos
   * @param {LbcAd} ad the ad to process
   * @param {boolean} isPrivateBetter is a private owner better than a pro ?
   * @returns {LbcCustomInfo} the custom info
   */
  function getOwnerInfo(ad, isPrivateBetter) {
    const { owner } = ad
    if (!owner) {
      utils.warn('no owner found in ad', ad)
      return {}
    }
    const text = [owner.type, ':', owner.name.toLocaleLowerCase()].join(' ')
    // oxlint-disable-next-line no-nested-ternary, no-magic-numbers
    const score = isPrivateBetter ? (owner.type === 'pro' ? 0.5 : 1.2) : 1
    return { score, text }
  }
  /**
   * Get floor info from the ad
   * @param {LbcHousingAd} ad the ad to process
   * @returns {LbcCustomInfo} the custom info
   */
  function getFloorNumberInfo(ad) {
    const floorNumber = ad.attributes.find(attribute => attribute.key === 'floor_number')
    if (floorNumber === undefined) return {}
    const text = humanReadableFloor(floorNumber.value)
    // oxlint-disable-next-line no-magic-numbers
    const score = floorNumber.value === '0' ? 0.5 : 1
    return { score, text }
  }
  /**
   * Add custom infos to the element
   * @param {LbcHousingAd} ad the housing ad to process
   * @returns {LbcCustomInfo[]} the custom infos
   */
  function getCustomInfosHousing(ad) {
    return [getOwnerInfo(ad, true), getDpeInfos(ad), getLocationInfo(ad), getSquareInfo(ad), getRoomsInfo(ad), getFloorNumberInfo(ad), getElevatorInfo(ad)]
  }
  /**
   * Get custom infos from a car ad
   * @param {LbcCarAd} ad the car ad to process
   * @returns {LbcCustomInfo[]} the custom infos
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: FIX me later
  function getCustomInfosCar(ad) {
    const infos = [getOwnerInfo(ad, false)]
    const year = Number.parseInt(ad.attributes.find(attribute => attribute.key === 'regdate')?.value ?? '', 10)
    if (year) infos.push({ score: utils.rangedScore(yearRules, year), text: `année : ${year}` })
    const mileage = Number.parseInt(ad.attributes.find(attribute => attribute.key === 'mileage')?.value ?? '', 10)
    if (mileage) infos.push({ score: utils.rangedScore(mileageRules, mileage), text: `kilométrage : ${mileage} km` })
    const fuel = ad.attributes.find(attribute => attribute.key === 'fuel')?.value_label.toLowerCase() ?? ''
    if (fuel) infos.push({ text: `carburant : ${fuel}` })
    const gearbox = ad.attributes.find(attribute => attribute.key === 'gearbox')?.value_label.toLowerCase() ?? ''
    // oxlint-disable-next-line no-magic-numbers
    if (gearbox) infos.push({ score: gearbox === 'automatique' ? 1.2 : 1, text: `boite : ${gearbox}` })
    const price = ad.price_cents / nbPercents
    if (price) infos.push({ score: utils.rangedScore(priceRules, price), text: `prix : ${price} €` })
    return infos
  }
  /**
   * Get display classes from the score
   * @param {number} score the score to get the classes from
   * @returns {string[]} the css classes
   */
  function getScoreClasses(score) {
    const classes = []
    if (score > 1) classes.push(...utils.tw('text-green-600'))
    // oxlint-disable-next-line no-magic-numbers
    if (score > 2) classes.push(...utils.tw('text-2xl font-bold'))
    if (score < 1) classes.push(...utils.tw('text-red-600'))
    return classes
  }
  /**
   * Compute the custom classes for the info
   * @param {LbcCustomInfo} info the info to get the classes from
   * @returns {string[]} the css classes
   */
  function getInfoClasses(info) {
    const classes = []
    if (info.classes) classes.push(...info.classes)
    classes.push(...getScoreClasses(info.score ?? 1))
    return classes
  }

  /**
   * Create a custom infos panel
   * @param {LbcCustomInfo[]} infos the infos to display
   * @returns {HTMLElement} the custom infos panel
   */
  function createCustomInfosPanel(infos) {
    const panel = document.createElement('div')
    panel.classList.add(...utils.tw('app-lbc-lpp-panel absolute right-0 top-0 rounded-lg bg-white p-2 shadow'))
    for (const info of infos) {
      const line = document.createElement('div')
      line.classList.add(...utils.tw('text-right'))
      if (info.text) line.textContent = info.text
      // oxlint-disable-next-line no-magic-numbers
      if (info.score !== undefined && !info.text?.includes('score')) line.title += `${info.text?.split(' : ')[0] ?? ''} score : ${info.score.toFixed(2)}`
      line.classList.add(...getInfoClasses(info))
      panel.append(line)
    }
    return panel
  }

  /**
   * Remove the pro tag from the ad
   * @param {LbcAd} ad the ad to process
   * @returns {void}
   */
  function removeProTag(ad) {
    const tag = utils.findOne('div[color="black"] span, [data-spark-component="tag"]', ad.element)
    if (tag?.textContent?.toLowerCase() !== 'pro') return
    if (tag.parentElement?.textContent?.toLowerCase() === 'pro') tag.parentElement.remove()
    else tag.remove()
  }

  /**
   * Get common infos from the ad
   * @param {LbcAd} ad the ad to process
   * @returns {LbcCustomInfo[]} the custom infos
   */
  function getCommonInfos(ad) {
    if (ad.owner.type === 'pro') removeProTag(ad)
    return []
  }

  /**
   * Add custom infos to the element
   * @param {LbcAd} ad the ad to process
   * @returns {void}
   */
  function addInfos(ad) {
    const type = getAdType(ad)
    const infos = getCommonInfos(ad)
    // @ts-expect-error type conversion from LbcAd to LbcHousingAd
    if (type === 'housing') infos.push(...getCustomInfosHousing(ad))
    // @ts-expect-error type conversion from LbcAd to LbcCarAd
    else if (type === 'car') infos.push(...getCustomInfosCar(ad))
    else utils.warn('un handled ad type', { ad, type })
    const score = infos.reduce((total, info) => total * (info.score ?? 1), 1)
    const scoreRounded = Math.round(score * nbPercents) / nbPercents
    // oxlint-disable-next-line no-nested-ternary, no-magic-numbers
    const classes = scoreRounded > 1 ? (scoreRounded > 2 ? ['text-4xl', 'font-bold'] : ['text-2xl', 'font-bold']) : []
    infos.push({ classes, score: scoreRounded, text: `score : ${scoreRounded}` })
    ad.element.append(createCustomInfosPanel(infos))
  }

  /**
   * Process a single ad
   * @param {LbcAd} ad the ad object
   * @returns {void}
   */
  function processAd(ad) {
    const element = getAdElement(ad)
    if (!element) return
    utils.log('process ad :', ad.subject, ad)
    element.classList.add(cls.marker)

    const [, link] = Array.from(element.children)
    if (!link) {
      utils.warn('no link found in ad', ad)
      return
    }
    if (!(link instanceof HTMLAnchorElement)) {
      utils.error('link is not an anchor element', link)
      return
    }
    ad.element = link
    addId(ad)
    addInfos(ad)
  }

  /**
   * Start the process
   * @returns {void}
   */
  function process() {
    const dataElement = document.querySelector('#__NEXT_DATA__')
    if (!dataElement) {
      utils.error('no data element found')
      return
    }
    const { props } = JSON.parse(dataElement.innerHTML)
    const searchData = props.pageProps?.initialProps?.searchData
    if (searchData === undefined) {
      utils.log('no page props data to parse')
      return
    }
    const { ads } = searchData
    utils.log(`processing ${ads.length} ads listing...`)
    for (const ad of ads) processAd(ad)
    removeViewedStyles()
  }
  const processDebounceTime = 1000
  const processDebounced = utils.debounce(process, processDebounceTime)
  globalThis.addEventListener('scroll', () => processDebounced())
  globalThis.addEventListener('load', () => processDebounced())
}

if (globalThis.window) LbcListings()
else module.exports = { getAdType, getElevatorInfo, getRoomsInfo, getSquareInfo, humanReadableFloor }
