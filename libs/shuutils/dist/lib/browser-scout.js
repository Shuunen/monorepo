/** biome-ignore-all assist/source/useSortedKeys: needed */ import { isBrowserEnvironment } from './environment.js';
// oxlint-disable-next-line sort-keys
const browsers = {
    // biome-ignore lint/style/useNamingConvention: it's ok
    Edge: /edge/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    Chrome: /chrome|chromium|crios/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    Firefox: /firefox|fxios/iu,
    'Internet Explorer': /msie|trident/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    Safari: /safari/iu,
    'Unknown browser': /./u
};
// oxlint-disable-next-line sort-keys
const operatingSystems = {
    // biome-ignore lint/style/useNamingConvention: it's ok
    Android: /android/iu,
    'Chrome OS': /CrOS/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    iOS: /iphone/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    Linux: /linux/iu,
    'Mac OS': /MacIntel|Macintosh|MacPPC/iu,
    // biome-ignore lint/style/useNamingConvention: it's ok
    Windows: /Win32|Win64|Windows/iu,
    'Unknown OS': /./u
};
// oxlint-disable-next-line sort-keys
const versions = {
    // biome-ignore lint/style/useNamingConvention: it's ok
    MSIE: RegExp("MSIE (?<version>[\\d.]+)", "iu"),
    // biome-ignore lint/style/useNamingConvention: it's ok
    Edge: RegExp("Edge\\/(?<version>[\\d.]+)", "iu"),
    // biome-ignore lint/style/useNamingConvention: it's ok
    Chrome: RegExp("Chrome\\/(?<version>[\\d.]+)", "iu"),
    // biome-ignore lint/style/useNamingConvention: it's ok
    Firefox: RegExp("Firefox\\/(?<version>[\\d.]+)", "iu"),
    generic: RegExp("Version\\/(?<version>[\\d.]+)", "iu"),
    rv: RegExp("rv:(?<version>[\\d.]+)", "iu")
};
/**
 * Get the user agent string
 * @returns the user agent string
 */ export function getUserAgent() {
    /* c8 ignore next */ return isBrowserEnvironment() ? globalThis.navigator.userAgent : 'Unknown user agent';
}
/**
 * Get the browser version from a user agent string
 * @param userAgent the user agent string to parse
 * @returns the browser version
 */ export function getVersion(userAgent = getUserAgent()) {
    var _regex_exec_groups, _regex_exec;
    var _regex_exec_groups_version;
    /* c8 ignore next */ for (const [browser, regex] of Object.entries(versions))if (regex.test(userAgent)) return (_regex_exec_groups_version = (_regex_exec = regex.exec(userAgent)) == null ? void 0 : (_regex_exec_groups = _regex_exec.groups) == null ? void 0 : _regex_exec_groups.version) != null ? _regex_exec_groups_version : `Unknown ${browser} version`;
    return 'Unknown version';
}
/**
 * Get the browser name from a user agent string
 * @param userAgent the user agent string to parse
 * @returns the browser name
 */ export function getBrowser(userAgent = getUserAgent()) {
    /* c8 ignore next 3 */ for (const [browser, regex] of Object.entries(browsers))if (regex.test(userAgent)) return browser;
    return 'Unknown browser';
}
/**
 * Get the operating system name from a user agent string
 * @param userAgent the user agent string to parse
 * @returns the operating system name
 */ export function getOperatingSystem(userAgent = getUserAgent()) {
    /* c8 ignore next 3 */ for (const [os, regex] of Object.entries(operatingSystems))if (regex.test(userAgent)) return os;
    return 'Unknown OS';
}
/**
 * Detect if the browser is running on mobile
 * @param userAgent the user agent like 'Mozilla/5.0...'
 * @returns true if the browser is running on mobile
 */ export function isMobile(userAgent = getUserAgent()) {
    // ontouchstart is now detected in HappyDom
    // if ('ontouchstart' in (typeof document === 'undefined' ? {} : document.documentElement)) return true
    if (userAgent.includes('Mobile')) return true;
    const browser = getBrowser(userAgent);
    return [
        'Android'
    ].includes(browser);
}
/**
 * Return a report of the browser context
 * @param context the browser context like : browser: 'Chrome', version: '91.0.4472', ...
 * @returns a textual report like : - Browser: Chrome 91.0.4472 - Language: en-US...
 */ export function browserReport(context) {
    return `
 - Browser : ${context.browser} ${context.version}
 - Language : ${context.language}
 - OS : ${context.os}
 - Platform : ${context.platform}
 - Is mobile : ${String(context.isMobile)}
 - Screen : ${context.screenWidth}x${context.screenHeight}
 - Url : ${context.url}
 - User agent : ${context.userAgent}
 `;
}
/**
 * Detect the browser context
 * @returns the context like { browser: 'Chrome', version: '91.0.4472', ... }
 // oxlint-disable-next-line require-returns-description
 * @copyright inspired from Ben Brooks Scholz https://github.com/benbscholz/detect Copyright (C) 2011
*/ export function browserContext() {
    var _globalThis_navigator_userAgentData;
    const isBrowser = isBrowserEnvironment();
    const userAgent = getUserAgent();
    const browser = getBrowser(userAgent);
    var _globalThis_navigator_userAgentData_platform;
    /* c8 ignore start */ return {
        browser,
        isInternetExplorer: browser === 'Internet Explorer',
        isMobile: isMobile(userAgent),
        language: isBrowser ? globalThis.navigator.language : 'Unknown language',
        os: getOperatingSystem(userAgent),
        platform: isBrowser ? (_globalThis_navigator_userAgentData_platform = (_globalThis_navigator_userAgentData = globalThis.navigator.userAgentData) == null ? void 0 : _globalThis_navigator_userAgentData.platform) != null ? _globalThis_navigator_userAgentData_platform : 'Unknown platform' : 'Unknown platform',
        screenHeight: isBrowser ? globalThis.screen.height : 0,
        screenWidth: isBrowser ? globalThis.screen.width : 0,
        url: isBrowser ? globalThis.location.href : 'Unknown url',
        userAgent,
        version: getVersion(userAgent)
    };
/* c8 ignore stop */ }

//# sourceMappingURL=browser-scout.js.map