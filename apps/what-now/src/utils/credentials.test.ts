import { expect, it } from "vitest";
import { checkUrlCredentials, parseClipboard, validateCredentials } from "./credentials.utils";
import { state } from "./state.utils";

const validUuid = "12345678-90ab-cdef-ffff-ffffffffffff";
const invalidUuid = "12345678-90ab-cdef-ffff-ffffffffffff!";
const validUrl = "https://zob.com";

it("parseClipboard A empty", () => {
  const { apiCollection, apiDatabase, webhook } = parseClipboard("");
  expect(apiCollection).toBe("");
  expect(apiDatabase).toBe("");
  expect(webhook).toBe("");
});

it("parseClipboard B one is invalid", () => {
  const { apiCollection, apiDatabase, webhook } = parseClipboard(`"${invalidUuid}\n${validUuid}\n${validUrl}"`);
  expect(apiCollection).toBe("");
  expect(apiDatabase).toBe("");
  expect(webhook).toBe("");
});

it("parseClipboard C all are valid", () => {
  const { apiCollection, apiDatabase, webhook } = parseClipboard(`"${validUuid}\n${validUuid}\n${validUrl}"`);
  expect(apiCollection).toBe(validUuid);
  expect(apiDatabase).toBe(validUuid);
  expect(webhook).toBe(validUrl);
});

it("validateCredentials A", () => {
  expect(validateCredentials("A")).toBe(false);
});

it("validateCredentials B valid credentials", () => {
  expect(validateCredentials(validUuid, validUuid)).toBe(true);
});

it("checkUrlCredentials A nothing setup", () => {
  expect(checkUrlCredentials()).toBe(false);
});

it("checkUrlCredentials B giving valid hash", () => {
  expect(checkUrlCredentials(`#${validUuid}&${validUuid}`)).toBe(true);
});

it("checkUrlCredentials C giving invalid hash", () => {
  state.apiDatabase = "";
  state.apiCollection = "";
  const hasSucceed = checkUrlCredentials(`#${invalidUuid}&${validUuid}`);
  expect(hasSucceed).toBe(false);
});

it("checkUrlCredentials D with a with valid base & token in state", () => {
  state.apiDatabase = validUuid;
  state.apiCollection = validUuid;
  const hasSucceed = checkUrlCredentials();
  expect(hasSucceed).toBe(true);
});
