import { readFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { blue, Logger, nbThird, parseJson, stringify, yellow } from "@monorepo/utils";
import dotenv from "dotenv";
import type { Task } from "../types";

// use me like :
// bun apps/what-now/src/bin/json-to-db.cli.ts apps/what-now/src/bin/tasks.json

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "./couchdb.env");
const logger = new Logger();

if (!statSync(envPath, { throwIfNoEntry: false })?.isFile()) {
  logger.error(`Missing environment file : ${blue(envPath)}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

const { COUCHDB_USER, COUCHDB_PASS, COUCHDB_URL, COUCHDB_DB } = process.env;
for (const varName of ["COUCHDB_USER", "COUCHDB_PASS", "COUCHDB_URL", "COUCHDB_DB"])
  if (!process.env[varName]) {
    logger.error(`Missing environment variable "${yellow(varName)}" in ${blue(envPath)} file`);
    process.exit(1);
  }

const filePath = process.argv.at(nbThird);
if (!filePath) {
  logger.error(
    `Please provide a path to the JSON file as an argument, ex : ${yellow("bun json-to-db.cli.ts path/to/json-tasks.json")}`,
  );
  process.exit(1);
}

const jsonContent = readFileSync(resolve(filePath), "utf8");
const jsonResult = parseJson<Task[]>(jsonContent);
if (!jsonResult.ok) {
  logger.error(`Failed to parse JSON file : ${yellow(jsonResult.error)}`);
  process.exit(1);
}

const tasks = jsonResult.value.map(task => ({ ...task, type: "task" }));

const auth = Buffer.from(`${COUCHDB_USER}:${COUCHDB_PASS}`).toString("base64");

const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB}/_bulk_docs`, {
  body: JSON.stringify({ docs: tasks }),
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  },
  method: "POST",
});

const results = (await response.json()) as { id: string; error?: string }[];

const errors = results.filter(result => result.error);
if (errors.length > 0) {
  logger.error(`Failed to insert some tasks : ${yellow(stringify(errors, true))}`);
  process.exit(1);
}

logger.info(`Successfully inserted ${blue(results.length.toString())} tasks into CouchDB !`);
