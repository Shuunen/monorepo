/** biome-ignore-all lint/performance/useTopLevelRegex: fix me later */
import { logger } from "./logger.utils";
import { type CredentialField, state } from "./state.utils";

/**
 * Parse clipboard
 * @param clipboard the clipboard content
 * @returns the parsed clipboard
 */
export function parseClipboard(clipboard: string) {
  // clipboard can contains something like : "appABC
  // patXYZ.123
  // https://zob.com"
  const regex = /"(?<apiDatabase>[\w-]{1,36})\n(?<apiCollection>[\w-]{1,36})\n(?<webhook>http[^"]+)"/u;
  const { apiCollection = "", apiDatabase = "", webhook = "" } = regex.exec(clipboard)?.groups ?? {};
  return { apiCollection, apiDatabase, webhook } satisfies Record<CredentialField, string>;
}

/**
 * Validate database credentials
 * @param databaseId the database id to use
 * @param collectionId the collection id to use
 * @returns true if credentials are valid
 */
export function validateCredentials(databaseId?: string, collectionId?: string) {
  const uuidRegex = /^[\w-]{1,36}$/u;
  const isDatabaseValid = databaseId !== undefined && typeof databaseId === "string" && uuidRegex.test(databaseId);
  const isCollectionValid = collectionId !== undefined && typeof collectionId === "string" && uuidRegex.test(collectionId);
  return isDatabaseValid && isCollectionValid;
}

/**
 * Check credentials
 * @param hash the hash to check
 * @returns true if the credentials are valid
 */
export function checkUrlCredentials(hash = "") {
  logger.info("check credentials", hash.length > 0 ? `and detected hash "${hash}"` : "");
  const matches = /#(?<database>[\w-]{1,36})&(?<collection>[\w-]{1,36})/u.exec(hash);
  if (matches?.groups?.database !== undefined && matches.groups.collection !== undefined && validateCredentials(matches.groups.database, matches.groups.collection)) {
    state.apiDatabase = matches.groups.database;
    state.apiCollection = matches.groups.collection;
    logger.info("credentials found in hash");
  }
  state.isSetup = validateCredentials(state.apiDatabase, state.apiCollection);
  logger.info("credentials are", state.isSetup ? "valid" : "invalid");
  state.statusInfo = state.isSetup ? "" : "Welcome dear user, please setup your credentials in settings.";
  return state.isSetup;
}
