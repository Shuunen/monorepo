/**
 * Check if the given option is present in the command line arguments
 * @param name the name of the option to check
 * @param process the process object to check for the option, defaults to globalThis.process
 * @returns true if the option is present, false otherwise
 */
export function hasOption(name: string, process: NodeJS.Process | undefined = globalThis.process): boolean {
  const argv = process?.argv ?? [];
  const env = process?.env?.[name] ?? "";
  return argv.includes(`--${name}`) || env.toString() === "true";
}

/**
 * For debugging purposes, print out the verbose output
 * @returns true if the verbose option is present
 */
export function isVerbose() {
  return hasOption("v") || hasOption("verbose") || hasOption("VERBOSE") || hasOption("debug") || hasOption("DEBUG");
}
