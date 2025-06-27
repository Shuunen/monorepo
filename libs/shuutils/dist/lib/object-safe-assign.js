import { isRecord } from './objects.js';
/**
 * Like Object.assign but only non-null/undefined values can overwrite
 * @param target Destination object
 * @param sources Object(s) to sequentially merge
 * @returns The resulting object merged
 */ // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: fix me later
export function safeAssign(target, ...sources) {
    if (sources.length === 0) return target;
    const source = sources.shift();
    if (isRecord(target) && isRecord(source)) // oxlint-disable-next-line max-depth
    {
        for(const key in source)if (isRecord(source[key])) {
            // oxlint-disable-next-line max-depth
            if (!target[key]) Object.assign(target, {
                [key]: {}
            });
            safeAssign(target[key], source[key]);
        } else if (source[key] !== null && source[key] !== undefined) Object.assign(target, {
            [key]: source[key]
        });
    }
    return safeAssign(target, ...sources);
}

//# sourceMappingURL=object-safe-assign.js.map