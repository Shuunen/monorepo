import { zodSnap } from "@monorepo/utils";
import { invariant } from "es-toolkit";
import { settingsSchemas } from "./page-settings.schemas";

describe("Page Settings", () => {
  const [settingsSchema] = settingsSchemas;
  invariant(settingsSchema, "settingsSchema is required for tests");

  it("settingsSchemas A should validate valid data", () => {
    const result = settingsSchema.safeParse({
      bucketId: "validbucketid1234567890",
      collectionId: "validcollectionid1234567890",
      databaseId: "validdatabaseid1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("settingsSchemas B should invalidate invalid data", () => {
    const result = settingsSchema.safeParse({
      bucketId: "invalidbucketid",
      databaseId: "invaliddatabaseid",
    });
    expect(result.success).toBe(false);
    expect(zodSnap(result.error)).toMatchInlineSnapshot(`
      [
        "bucketId | invalid_format | Appwrite storage bucket id is invalid",
        "collectionId | invalid_type | Invalid input: expected string, received undefined",
        "databaseId | invalid_format | Appwrite database id is invalid",
      ]
    `);
  });
});
