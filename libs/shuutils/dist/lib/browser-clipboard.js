import { consoleLog } from './browser-console.js';
import { Result } from './result.js';
import { ellipsis } from './strings.js';
/**
 * Copy data to the clipboard
 * @param stuff the data to copy
 * @param willLog if true, will console log the data before copying
 * @returns a Result object
 */ export async function copyToClipboard(stuff, willLog = false) {
    let text = '';
    try {
        text = typeof stuff === 'string' ? stuff : JSON.stringify(stuff);
    } catch (e) {
        return Result.error('failed to stringify the data');
    }
    try {
        if (willLog) consoleLog(`copying to clipboard : ${ellipsis(text)}`);
        // oxlint-disable-next-line no-undef
        await navigator.clipboard.writeText(text);
        return Result.ok(`copied to clipboard : ${ellipsis(text)}`);
    /* c8 ignore next 4 */ } catch (e) {
        return Result.error('clipboard not available');
    }
}
/**
 * Read the clipboard content
 * @param willLog if true, will console log the content of the clipboard
 * @param clipboard the clipboard object, default is navigator.clipboard
 * @returns the content of the clipboard
 */ // oxlint-disable-next-line no-undef
export async function readClipboard(willLog = false, clipboard = navigator.clipboard) {
    /* c8 ignore next */ if (!clipboard) return Result.error('clipboard not available');
    if (willLog) consoleLog('reading clipboard...');
    const text = await clipboard.readText();
    if (willLog) consoleLog(`got this text from clipboard : ${ellipsis(text)}`);
    return Result.ok(text);
}

//# sourceMappingURL=browser-clipboard.js.map