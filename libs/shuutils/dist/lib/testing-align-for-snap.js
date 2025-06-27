import { nbSpacesIndent } from './constants.js';
/**
 * Align & clean dynamic data & operating system related stuff that can mess-up the snaps
 * @param content the string to clean
 * @returns the content aligned for snapshots
 * @example alignForSnap('Lu et approuvé le 16/05/2024 17:36:32') // => 'Lu et approuvé le xx/xx/xxxx xx:xx:xx'
 * @example alignForSnap({ value: '\\documents\\my-file.pdf' }) // => '{ "value": "/documents/my-file.pdf" }'
 */ export function alignForSnap(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content, undefined, nbSpacesIndent);
    return text// 16/05/2024 17:36:32 => xx/xx/xxxx xx:xx:xx
    .replace(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/gu, 'xx/xx/xxxx xx:xx:xx')// 6/25/2024, 11:21:23 AM => xx/xx/xxxx xx:xx:xx
    .replace(/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [ap]m/giu, 'xx/xx/xxxx xx:xx:xx')// 2024-05-16T15:36:32.000Z => xxxx-xx-xxTxx:xx:xx.000Z
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/gu, 'xxxx-xx-xxTxx:xx:xx.000Z')// \\documents\\file.pdf => /documents/file.pdf
    .replace(RegExp('\\\\+(?<letter>[^"])', "gu"), '/$<letter>');
}

//# sourceMappingURL=testing-align-for-snap.js.map