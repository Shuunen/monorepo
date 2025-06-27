/**
 * Check if the given option is present in the command line arguments
 * @param name the name of the option to check
 * @returns true if the option is present, false otherwise
 */ export function hasOption(name) {
    var _process_env;
    /* c8 ignore next 2 */ // could be nice to check for environment variables too
    if (typeof process === 'undefined') return false;
    var _process_argv, _process_env_name;
    // oxlint-disable-next-line no-undef
    return ((_process_argv = process.argv) != null ? _process_argv : []).includes(`--${name}`) || ((_process_env_name = (_process_env = process.env) == null ? void 0 : _process_env[name]) != null ? _process_env_name : '').toString() === 'true';
}
/**
 * For debugging purposes, print out the verbose output
 * @returns true if the verbose option is present
 */ export function isVerbose() {
    return hasOption('v') || hasOption('verbose') || hasOption('VERBOSE') || hasOption('debug') || hasOption('DEBUG');
}

//# sourceMappingURL=flags.js.map