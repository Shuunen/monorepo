import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { Logger, parseJson, Result, stringify } from "@monorepo/utils";

const logger = new Logger({ minimumLevel: /* c8 ignore next */ import.meta.main ? "3-info" : "7-error" });
const commitRegex = /(?<ticket>\w+-\d+)[ :]+(?<type>\w+(?<scope>\([\w-]+\))?: ?)?(?<message>[\w -.:/<>]+)/;

/**
 * @param {string} commitLine single commit line to be parsed
 * @returns an object with {date, hash, message, ticket} or undefined depending on the retrievable information from the commit itself
 */
export function parseSingleCommit(commitLine: string) {
  const [hash, date, subject] = commitLine.trim().split("|");
  const match = commitRegex.exec(subject);
  if (match?.groups) {
    const { ticket, message } = match.groups;
    return { date, hash, message, ticket };
  }
  return undefined;
}

export function getHistory(filters: string[] = []) {
  const command = `git log --reverse --format="%h|%ad|%s" --date=short`;
  const result = Result.trySafe(() => execSync(command, { encoding: "utf8" }).trim());
  const { value: lines = "" } = Result.unwrap(result);
  return lines
    .split("\n")
    .map(commit => parseSingleCommit(commit))
    .filter(commit =>
      // oxlint-disable-next-line max-nested-callbacks
      filters.length > 0 ? filters.some(prefix => commit?.ticket.startsWith(prefix)) : Boolean(commit),
    )
    .toReversed();
}

export function getReleaseVersion() {
  const read = Result.trySafe(() => readFileSync("./package.json", "utf8"));
  if (!read.ok) {
    logger.error(`Failed to read package.json : ${read.error}`);
    return "failed to read package.json";
  }
  const json = parseJson<{ version?: string }>(read.value);
  if (!json.ok) {
    logger.error(`Failed to parse package.json : ${json.error}`);
    return "failed to parse package.json";
  }
  return json.value.version ?? "no version found";
}

export function getOutput(args: string[] = process.argv) {
  const outputArg = args.find(arg => arg.startsWith("--output="));
  if (!outputArg) {
    throw new Error("Usage: changelog-generator.cli.ts --output=<path>");
  }
  return outputArg.slice("--output=".length);
}

export function getFilters(args: string[] = process.argv) {
  const filterArg = args.find(arg => arg.startsWith("--filter="));
  if (!filterArg) {
    return [];
  }
  return filterArg.slice("--filter=".length).split(",").filter(Boolean);
}

export function main() {
  logger.info("Generating changelog...");
  const output = getOutput();
  const filters = getFilters();
  const history = getHistory(filters);
  const releaseVersion = getReleaseVersion();
  const data = { history, releaseVersion };
  const fileContent = `export const generatedChangeLog = ${stringify(data, true)}`;
  writeFileSync(output, fileContent);
  logger.info(`Changelog generated successfully at ${output}`);
}

/* c8 ignore start */
if (import.meta.main) {
  main();
}
