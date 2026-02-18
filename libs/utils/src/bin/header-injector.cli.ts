import { readFileSync, writeFileSync } from "node:fs";
import glob from "tiny-glob";
import { gray, green, red, yellow } from "../lib/colors.js";
import { nbThird } from "../lib/constants.js";
import { Logger } from "../lib/logger.js";
import { Result } from "../lib/result.js";

// use me like :
//  bun libs/utils/src/bin/header-injector.cli.ts --header="Copyright 2026 ACME"
//  bun libs/utils/src/bin/header-injector.cli.ts --remove

const logger = new Logger({ minimumLevel: /* c8 ignore next */ import.meta.main ? "3-info" : "7-error" });
const headerPattern = /^\/\/ .+$/;
const metrics = {
  /** Number of files where the header was added */
  addedHeader: 0,
  /** Number of files that already have the header */
  hasHeader: 0,
  /** Number of files that move the header */
  moveHeader: 0,
  /** Number of files that do not have the header */
  noHeader: 0,
  /** Number of files that could not be read */
  readError: 0,
  /** Number of files where the header was removed */
  removedHeader: 0,
  /** Number of files that could not be written */
  writeError: 0,
};
type Metrics = typeof metrics;

/**
 * Parse command-line arguments into a key-value object
 * @param argv the command-line arguments
 * @returns parsed arguments as key-value pairs
 */
function parseArgs(argv: string[]): Record<string, string> {
  return Object.fromEntries(
    argv.slice(nbThird).map(arg => {
      const parts = arg.replace("--", "").split("=");
      return parts.length === 1 ? [parts[0], ""] : parts;
    }),
  );
}

/**
 * Remove header from a file
 * @param file the file path to process
 * @param content the file content
 * @param stats the metrics object to update
 * @returns void
 */
function removeHeader(file: string, content: string, stats: Metrics) {
  const lines = content.split("\n");
  if (lines.length === 0 || !headerPattern.test(lines[0])) {
    stats.noHeader += 1;
    return;
  }
  const newContent = lines.slice(1).join("\n");
  const writeResult = Result.trySafe(() => writeFileSync(file, newContent));
  if (!writeResult.ok) {
    stats.writeError += 1;
    return;
  }
  stats.removedHeader += 1;
}

/**
 * Add or move header in a file
 * @param file the file path to process
 * @param header the header string to inject
 * @param content the file content
 * @param stats the metrics object to update
 * @returns void
 */
// oxlint-disable-next-line max-params
function addOrMoveHeader(file: string, header: string, content: string, stats: Metrics) {
  const lines = content.split("\n");
  const headerLine = lines.indexOf(header);
  if (headerLine === 0) {
    stats.hasHeader += 1;
    return;
  }
  let newContent = `${header}\n${content}`;
  if (headerLine === -1) {
    stats.noHeader += 1;
  } else {
    stats.moveHeader += 1;
    newContent = `${header}\n${content
      .split("\n")
      .filter(str => str !== header)
      .join("\n")}`;
  }
  const writeResult = Result.trySafe(() => writeFileSync(file, newContent));
  if (!writeResult.ok) {
    stats.writeError += 1;
    return;
  }
  stats.addedHeader += 1;
}

type ProcessFileOptions = { file: string; header: string; isRemoveMode: boolean; stats: Metrics };

/**
 * Process a single file to check and inject header if missing
 * @param options the options for processing the file
 * @returns void
 */
function processFile(options: ProcessFileOptions) {
  const { file, header, isRemoveMode, stats } = options;
  const readResult = Result.trySafe(() => readFileSync(file, "utf8"));
  if (!readResult.ok) {
    stats.readError += 1;
    return;
  }
  const content = readResult.value;
  if (isRemoveMode) {
    removeHeader(file, content, stats);
  } else {
    addOrMoveHeader(file, header, content, stats);
  }
}

/**
 * Generate a report string from the metrics
 * @param data the metrics object
 * @returns formatted report string
 */
export function report(data: Metrics): string {
  return `Header Injector report :
  - Files without header : ${data.noHeader === 0 ? gray("0") : yellow(data.noHeader.toString())}
  - Files with header : ${data.hasHeader === 0 ? gray("0") : green(data.hasHeader.toString())}
  - Files with header misplaced: ${data.moveHeader === 0 ? gray("0") : green(data.moveHeader.toString())}
  - Files with header added : ${data.addedHeader === 0 ? gray("0") : green(data.addedHeader.toString())}
  - Files with header removed : ${data.removedHeader === 0 ? gray("0") : green(data.removedHeader.toString())}
  - Files read errors : ${data.readError === 0 ? gray("0") : red(data.readError.toString())}
  - Files write errors : ${data.writeError === 0 ? gray("0") : red(data.writeError.toString())}
  `.trim();
}

/**
 * Entry point for the header-injector CLI
 * @param argv the command-line arguments to parse (for testing purposes)
 * @returns metrics or error
 */
export async function main(argv: string[]) {
  const stats = structuredClone(metrics);
  const args = parseArgs(argv);
  logger.info("header-injector.cli.ts started with args", yellow(JSON.stringify(args)));
  const isRemoveMode = args.remove !== undefined;
  if (!isRemoveMode && !args.header) {
    return Result.error("missing header argument");
  }
  const allFiles = await glob("**/*.ts", { filesOnly: true });
  const files = allFiles.filter(file => !file.endsWith(".d.ts") && !file.endsWith(".gen.ts"));
  const header = isRemoveMode ? "" : `// ${args.header}`;
  logger.info(`${isRemoveMode ? "Removing" : "Scanning"} headers of ${files.length} files...`);
  for (const file of files) {
    processFile({ file, header, isRemoveMode, stats });
  }
  return Result.ok(stats);
}

/* c8 ignore start */
if (import.meta.main) {
  const result = await main(process.argv);
  if (result.ok) {
    logger.info(report(result.value));
  } else {
    logger.error("header-injector.cli.ts finished with error");
  }
}
