/**
 * Check if the environment is a test environment
 * @returns true if the environment is a test environment
 */ export function isTestEnvironment() {
    const properties = [
        'jest',
        'mocha',
        '__vitest_environment__',
        '__vitest_required__'
    ];
    const hasTestBin = properties.some((property)=>property in globalThis);
    /* c8 ignore next 3 */ if (hasTestBin) return true;
    // @ts-expect-error globalThis.Bun is not defined in some environments
    const useBunTest = 'Bun' in globalThis && globalThis.Bun && globalThis.Bun.argv.join(' ').includes('.test.');
    return useBunTest;
}
/**
 * Check if the environment is a browser environment
 * @param userAgent optional, the user agent to check, default is navigator.userAgent
 * @returns true if the environment is a browser environment
 */ export function isBrowserEnvironment(userAgent = (()=>{
    var _globalThis_navigator;
    return (_globalThis_navigator = globalThis.navigator) == null ? void 0 : _globalThis_navigator.userAgent;
})()) {
    /* c8 ignore next */ if (!userAgent) return false;
    const isHappyDom = userAgent.includes('HappyDOM');
    if (isHappyDom) return false;
    return typeof document !== 'undefined' && globalThis.matchMedia !== undefined;
}

//# sourceMappingURL=environment.js.map