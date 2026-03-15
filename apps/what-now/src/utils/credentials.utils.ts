import { parseJson, Result } from "@monorepo/utils";
import { z } from "zod";
import { logger } from "./logger.utils";
import { state } from "./state.utils";

const credentialsSchema = z.object({
  couchDb: z
    .string()
    .min(1)
    .regex(/^[\w-]+$/u, "Couch DB name must only contain letters, numbers, underscores or dashes"),
  couchPass: z.string().min(1, "Couch Pass is required"),
  couchUrl: z
    .string()
    .min(1, "Couch URL is required")
    .regex(/^https?:\/\/.+/u, "Couch URL must be a valid HTTP or HTTPS URL"),
  couchUser: z.string().min(1, "Couch User is required"),
  webhook: z.string().regex(/^https?:\/\/.+/u, "Webhook must be a valid HTTP or HTTPS URL"),
});

type Credentials = z.infer<typeof credentialsSchema>;

export function alignClipboard(text: string) {
  return text
    .replaceAll(/: ?""(?<thing>[,\n])/gu, ': "__EMPTY__"$<thing>')
    .replaceAll('""', '"')
    .replaceAll('"__EMPTY__"', '""')
    .replace('"{', "{")
    .replace('}"', "}"); // need to replace double double quotes with single double quotes (Google Sheet issue -.-'''''')
}

/**
 * Parse clipboard
 * @param clipboard the clipboard content
 * @returns the parsed clipboard
 */
export function parseClipboard(clipboard: string) {
  const json = parseJson(alignClipboard(clipboard));
  if (!json.ok) {
    logger.debug("clipboard is not a valid JSON");
    return Result.error("clipboard is not a valid JSON");
  }
  const parsed = credentialsSchema.safeParse(json.value);
  if (!parsed.success) {
    logger.warn("clipboard JSON does not match credentials schema", parsed.error);
    return Result.error(`clipboard JSON does not match credentials schema : ${parsed.error.message}`);
  }
  return Result.ok(parsed.data);
}

/**
 * Validate settings required by the app
 * @param couchUrl the couchdb base URL
 * @param couchUser the couchdb username
 * @param couchPass the couchdb password
 * @param couchDb the couchdb database name
 * @param webhook the webhook URL to use
 * @returns true if settings are valid
 */
// oxlint-disable-next-line max-params
export function validateCredentials(
  couchUrl?: string,
  couchUser?: string,
  couchPass?: string,
  couchDb?: string,
  webhook?: string,
) {
  if (typeof couchUrl !== "string" || couchUrl.length === 0) return false;
  if (typeof couchUser !== "string" || couchUser.length === 0) return false;
  if (typeof couchPass !== "string" || couchPass.length === 0) return false;
  if (typeof couchDb !== "string" || couchDb.length === 0) return false;
  const httpUrlRegex = /^https?:\/\/.+/u;
  const databaseRegex = /^[\w-]+$/u;
  if (!httpUrlRegex.test(couchUrl)) return false;
  if (!databaseRegex.test(couchDb)) return false;
  if (webhook === undefined || webhook === "") return true;
  return httpUrlRegex.test(webhook);
}

/**
 * Check credentials
 * @param hash the hash to check
 * @returns true if the credentials are valid
 */
export function checkUrlCredentials(hash = "") {
  logger.info("check credentials", hash.length > 0 ? `and detected hash "${hash}"` : "");
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const hashCredentials = {
    couchDb: hashParams.get("couchDb") ?? "",
    couchPass: hashParams.get("couchPass") ?? "",
    couchUrl: hashParams.get("couchUrl") ?? "",
    couchUser: hashParams.get("couchUser") ?? "",
    webhook: hashParams.get("webhook") ?? "",
  } satisfies Credentials;
  if (
    validateCredentials(
      hashCredentials.couchUrl,
      hashCredentials.couchUser,
      hashCredentials.couchPass,
      hashCredentials.couchDb,
      hashCredentials.webhook,
    )
  ) {
    state.couchDb = hashCredentials.couchDb;
    state.couchPass = hashCredentials.couchPass;
    state.couchUrl = hashCredentials.couchUrl;
    state.couchUser = hashCredentials.couchUser;
    state.webhook = hashCredentials.webhook;
    logger.info("credentials found in hash");
  }
  state.isSetup = validateCredentials(state.couchUrl, state.couchUser, state.couchPass, state.couchDb, state.webhook);
  logger.info("credentials are", state.isSetup ? "valid" : "invalid");
  state.statusInfo = state.isSetup ? "" : "Welcome dear user, please setup your credentials in settings.";
  return state.isSetup;
}
