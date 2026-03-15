import { stringify } from "@monorepo/utils";
import { invariant } from "es-toolkit";
import { checkUrlCredentials, parseClipboard, validateCredentials } from "./credentials.utils";
import { state } from "./state.utils";

const validCouchUrl = "http://127.0.0.1:1212";
const validCouchUser = "validUser";
const validCouchPass = "superpass";
const validCouchDb = "that-db";
const validUrl = "https://zob.com";

it("parseClipboard A empty", () => {
  const result = parseClipboard("");
  expect(result.ok).toBe(false);
  invariant(!result.ok, "expected result to be an error");
  expect(result.error).toBe("clipboard is not a valid JSON");
});

it("parseClipboard B invalid content", () => {
  const result = parseClipboard("not-a-url");
  expect(result.ok).toBe(false);
  invariant(!result.ok, "expected result to be an error");
  expect(result.error).toBe("clipboard is not a valid JSON");
});

it("parseClipboard C valid json", () => {
  const result = parseClipboard(
    stringify({
      couchUrl: validCouchUrl,
      couchUser: validCouchUser,
      couchPass: validCouchPass,
      couchDb: validCouchDb,
      webhook: validUrl,
    }),
  );
  expect(result.ok).toBe(true);
  invariant(result.ok, "expected result to be ok");
  const { couchDb, couchPass, couchUrl, couchUser, webhook } = result.value;
  expect(couchDb).toBe(validCouchDb);
  expect(couchPass).toBe(validCouchPass);
  expect(couchUrl).toBe(validCouchUrl);
  expect(couchUser).toBe(validCouchUser);
  expect(webhook).toBe(validUrl);
});

it("parseClipboard D valid json with invalid values", () => {
  const result = parseClipboard(
    stringify({
      couchUrl: "invalid-url",
      couchUser: validCouchUser,
      couchPass: validCouchPass,
      couchDb: validCouchDb,
      webhook: validUrl,
    }),
  );
  expect(result.ok).toBe(false);
  invariant(!result.ok, "expected result to be an error");
  expect(result.error).toContain("clipboard JSON does not match credentials schema");
});

it("validateCredentials A missing couchUrl", () => {
  expect(validateCredentials("", validCouchUser, validCouchPass, validCouchDb, validUrl)).toBe(false);
});

it("validateCredentials A2 missing couchUser", () => {
  expect(validateCredentials(validCouchUrl, "", validCouchPass, validCouchDb, validUrl)).toBe(false);
});

it("validateCredentials A3 missing couchPass", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, "", validCouchDb, validUrl)).toBe(false);
});

it("validateCredentials A4 missing couchDb", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, validCouchPass, "", validUrl)).toBe(false);
});

it("validateCredentials A5 invalid couchUrl", () => {
  expect(validateCredentials("ftp://db.local", validCouchUser, validCouchPass, validCouchDb, validUrl)).toBe(false);
});

it("validateCredentials B invalid couchDb", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, validCouchPass, "what now", validUrl)).toBe(false);
});

it("validateCredentials C invalid webhook", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, validCouchPass, validCouchDb, "ftp://zob.com")).toBe(false);
});

it("validateCredentials D empty webhook is valid", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, validCouchPass, validCouchDb, "")).toBe(true);
});

it("validateCredentials E valid full credentials", () => {
  expect(validateCredentials(validCouchUrl, validCouchUser, validCouchPass, validCouchDb, validUrl)).toBe(true);
});

it("checkUrlCredentials A no hash keeps setup false", () => {
  state.couchUrl = "";
  state.couchUser = "";
  state.couchPass = "";
  state.couchDb = "";
  state.webhook = "";
  expect(checkUrlCredentials()).toBe(false);
});

it("checkUrlCredentials B parse credentials from hash", () => {
  state.couchUrl = "";
  state.couchUser = "";
  state.couchPass = "";
  state.couchDb = "";
  state.webhook = "";
  const encodedCouchUrl = encodeURIComponent(validCouchUrl);
  const encodedCouchUser = encodeURIComponent(validCouchUser);
  const encodedCouchPass = encodeURIComponent(validCouchPass);
  const encodedCouchDb = encodeURIComponent(validCouchDb);
  const encodedWebhook = encodeURIComponent(validUrl);
  const hash = `#couchUrl=${encodedCouchUrl}&couchUser=${encodedCouchUser}&couchPass=${encodedCouchPass}&couchDb=${encodedCouchDb}&webhook=${encodedWebhook}`;
  expect(checkUrlCredentials(hash)).toBe(true);
  expect(state.couchUrl).toBe(validCouchUrl);
  expect(state.couchUser).toBe(validCouchUser);
  expect(state.couchPass).toBe(validCouchPass);
  expect(state.couchDb).toBe(validCouchDb);
  expect(state.webhook).toBe(validUrl);
});

it("checkUrlCredentials C invalid hash keeps app not setup", () => {
  state.couchUrl = "";
  state.couchUser = "";
  state.couchPass = "";
  state.couchDb = "";
  state.webhook = "";
  const hasSucceed = checkUrlCredentials("#invalid");
  expect(hasSucceed).toBe(false);
});

it("checkUrlCredentials D invalid webhook hash does not overwrite credentials", () => {
  state.couchUrl = validCouchUrl;
  state.couchUser = validCouchUser;
  state.couchPass = validCouchPass;
  state.couchDb = validCouchDb;
  state.webhook = validUrl;
  const encodedCouchUrl = encodeURIComponent(validCouchUrl);
  const encodedCouchUser = encodeURIComponent(validCouchUser);
  const encodedCouchPass = encodeURIComponent(validCouchPass);
  const encodedCouchDb = encodeURIComponent(validCouchDb);
  const encodedWebhook = encodeURIComponent("ftp://invalid.example");
  const hash = `#couchUrl=${encodedCouchUrl}&couchUser=${encodedCouchUser}&couchPass=${encodedCouchPass}&couchDb=${encodedCouchDb}&webhook=${encodedWebhook}`;
  const hasSucceed = checkUrlCredentials(hash);
  expect(hasSucceed).toBe(true);
  expect(state.couchUrl).toBe(validCouchUrl);
  expect(state.couchUser).toBe(validCouchUser);
  expect(state.couchPass).toBe(validCouchPass);
  expect(state.couchDb).toBe(validCouchDb);
  expect(state.webhook).toBe(validUrl);
});
