/**
 * Convert to Unix path
 * @param  filepath the file path to normalize
 * @returns  The Unix path
 */ export function toUnixPath(filepath) {
    return filepath.replace(/\\+/giu, '/');
}

//# sourceMappingURL=system.js.map