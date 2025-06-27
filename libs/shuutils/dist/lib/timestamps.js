import { nbMsInSecond } from './constants.js';
/**
 * Give timestamp of a date or now in seconds
 * @param date input date
 * @returns number like : 1541258097
 */ export function getTimestamp(date = new Date()) {
    return Math.round(date.getTime() / nbMsInSecond);
}
/**
 * Give timestamp of a date or now in milliseconds
 * @param date input date
 * @returns number like : 1541258116567
 */ export function getTimestampMs(date = new Date()) {
    return date.getTime();
}

//# sourceMappingURL=timestamps.js.map