import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  buildStepperSteps,
  checkZodBoolean,
  field,
  fields,
  filterDataForSummary,
  filterSchema,
  forms,
  getDefaultValues,
  getFieldMetadata,
  getFieldMetadataOrThrow,
  getFormFieldRender,
  getInitialStep,
  getKeyMapping,
  getLastAccessibleStepIndex,
  getStepMetadata,
  getZodEnumOptions,
  isFieldVisible,
  isStepClickable,
  isZodArray,
  isZodBoolean,
  isZodDate,
  isZodEnum,
  isZodFile,
  isZodNumber,
  isZodString,
  mapExternalDataToFormFields,
  mockSubmit,
  normalizeData,
  normalizeDataForSchema,
  parseDependsOn,
  section,
  sectionsFromEditableSteps,
  step,
} from "./auto-form.utils"; // oxlint-disable-line max-dependencies
import { imageSchemaOptional, imageSchemaRequired } from "./form-field-upload.const";

const isoDateStringToDateInstance = z.codec(z.iso.date(), z.date(), {
  decode: isoDateString => new Date(isoDateString),
  encode: date => date.toISOString().split("T")[0],
});

describe("auto-form.utils", () => {
  // isZodEnum
  it("isZodEnum A should detect ZodEnum", () => {
    const schema = z.enum(["foo", "bar"]);
    expect(isZodEnum(schema)).toBe(true);
  });
  it("isZodEnum B should detect optional ZodEnum", () => {
    const schema = z.enum(["foo", "bar"]).optional();
    expect(isZodEnum(schema)).toBe(true);
  });
  it("isZodEnum C should return false for non-enum", () => {
    const schema = z.string();
    expect(isZodEnum(schema)).toBe(false);
  });
  // getZodEnumOptions
  it("getZodEnumOptions A should detect ZodEnum and return options", () => {
    const schema = z.enum(["foo", "bar"]);
    const result = getZodEnumOptions(schema);
    if (!result.ok) {
      throw new Error("Expected success but got error");
    }
    expect(result.value).toEqual([
      { label: "Foo", value: "foo" },
      { label: "Bar", value: "bar" },
    ]);
  });
  it("getZodEnumOptions B should also works with optional ZodEnum", () => {
    const schema = z.enum(["foo", "bar"]).optional();
    const result = getZodEnumOptions(schema);
    if (!result.ok) {
      throw new Error("Expected success but got error");
    }
    expect(result.value).toEqual([
      { label: "Foo", value: "foo" },
      { label: "Bar", value: "bar" },
    ]);
  });
  it("getZodEnumOptions C should return error for non-enum", () => {
    const schema = z.string();
    const result = getZodEnumOptions(schema);
    expect(result.ok).toBe(false);
  });
  it("getZodEnumOptions D should use custom options from metadata", () => {
    const schema = z.enum(["us", "uk", "fr"]).meta({
      options: [
        { label: "🇺🇸 United States", value: "us" },
        { label: "🇬🇧 United Kingdom", value: "uk" },
        { label: "🇫🇷 France", value: "fr" },
      ],
    });
    const result = getZodEnumOptions(schema);
    if (!result.ok) {
      throw new Error("Expected success but got error");
    }
    expect(result.value).toEqual([
      { label: "🇺🇸 United States", value: "us" },
      { label: "🇬🇧 United Kingdom", value: "uk" },
      { label: "🇫🇷 France", value: "fr" },
    ]);
  });
  it("getZodEnumOptions E should handle optional enum with custom options", () => {
    const schema = z
      .enum(["xs", "sm", "md"])
      .optional()
      .meta({
        options: [
          { label: "Extra Small", value: "xs" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
        ],
      });
    const result = getZodEnumOptions(schema);
    if (!result.ok) {
      throw new Error("Expected success but got error");
    }
    expect(result.value).toEqual([
      { label: "Extra Small", value: "xs" },
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
    ]);
  });
  // isZodBoolean
  it("isZodBoolean A should detect ZodBoolean", () => {
    const schema = z.boolean();
    expect(isZodBoolean(schema)).toBe(true);
  });
  it("isZodBoolean B should detect optional ZodBoolean", () => {
    const schema = z.boolean().optional();
    expect(isZodBoolean(schema)).toBe(true);
  });
  it("isZodBoolean C should return false for non-boolean", () => {
    const schema = z.string();
    expect(isZodBoolean(schema)).toBe(false);
  });
  it("isZodBoolean D should handle ZodLiteral true", () => {
    const schema = z.literal(true);
    expect(isZodBoolean(schema)).toBe(true);
  });
  it("isZodBoolean E should handle ZodLiteral false", () => {
    const schema = z.literal(false);
    expect(isZodBoolean(schema)).toBe(true);
  });
  it("isZodBoolean D should handle ZodLiteral non-boolean", () => {
    const schema = z.literal("foo");
    expect(isZodBoolean(schema)).toBe(false);
  });
  // checkZodBoolean
  it("checkZodBoolean A should detect ZodBoolean", () => {
    const schema = z.boolean();
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema);
    expect(isBoolean).toBe(true);
    expect(booleanLiteralValue).toBe(false);
    expect(isBooleanLiteral).toBe(false);
  });
  it("checkZodBoolean B should detect ZodLiteral true", () => {
    const schema = z.literal(true);
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema);
    expect(isBoolean).toBe(true);
    expect(booleanLiteralValue).toBe(true);
    expect(isBooleanLiteral).toBe(true);
  });
  it("checkZodBoolean C should detect ZodLiteral false", () => {
    const schema = z.literal(false);
    const { isBoolean, booleanLiteralValue, isBooleanLiteral } = checkZodBoolean(schema);
    expect(isBoolean).toBe(true);
    expect(booleanLiteralValue).toBe(false);
    expect(isBooleanLiteral).toBe(true);
  });
  it("checkZodBoolean D should detect optional ZodBoolean", () => {
    const schema = z.boolean().optional();
    const { isBoolean } = checkZodBoolean(schema);
    expect(isBoolean).toBe(true);
  });
  // checkZodNumber
  it("checkZodNumber A should detect ZodNumber", () => {
    const schema = z.number();
    expect(isZodNumber(schema)).toBe(true);
  });
  it("checkZodNumber B should detect optional ZodNumber", () => {
    const schema = z.number().optional();
    expect(isZodNumber(schema)).toBe(true);
  });
  it("checkZodNumber C should return false for non-number", () => {
    const schema = z.string();
    expect(isZodNumber(schema)).toBe(false);
  });

  // checkZodFile
  it("checkZodFile A should detect ZodFile", () => {
    const schema = z.file();
    expect(isZodFile(schema)).toBe(true);
  });
  it("checkZodFile B should detect optional ZodFile", () => {
    const schema = z.file().optional();
    expect(isZodFile(schema)).toBe(true);
  });
  it("checkZodFile C should detect ZodEffects wrapping ZodFile", () => {
    const schema = imageSchemaRequired;
    expect(isZodFile(schema)).toBe(true);
  });
  it("checkZodFile D should detect optional ZodEffects wrapping ZodFile", () => {
    const schema = imageSchemaOptional;
    expect(isZodFile(schema)).toBe(true);
  });
  it("checkZodFile E should return false for non-file", () => {
    const schema = z.string();
    expect(isZodFile(schema)).toBe(false);
  });

  // isFieldVisible
  it("isFieldVisible A should return true if no dependsOn", () => {
    const schema = z.string().meta({ label: "A" });
    expect(isFieldVisible(schema, {})).toBe(true);
  });
  it("isFieldVisible B should return false if dependsOn is not set in data", () => {
    const schema = z.string().meta({ dependsOn: "foo", label: "A" });
    expect(isFieldVisible(schema, {})).toBe(false);
  });
  it("isFieldVisible C should return true if dependsOn is set in data", () => {
    const schema = z.string().meta({ dependsOn: "foo", label: "A" });
    expect(isFieldVisible(schema, { foo: 1 })).toBe(true);
  });
  it("isFieldVisible D should handle missing meta function", () => {
    const schema = z.string();
    expect(isFieldVisible(schema, {})).toBe(true);
  });
  it("isFieldVisible E should handle meta returning undefined", () => {
    const schema = z.string();
    expect(isFieldVisible(schema, {})).toBe(true);
  });
  it("isFieldVisible F should handle field=value syntax with matching value", () => {
    const schema = z.string().meta({ dependsOn: "breed=dog", label: "A" });
    expect(isFieldVisible(schema, { breed: "dog" })).toBe(true);
  });
  it("isFieldVisible G should handle field=value syntax with non-matching value", () => {
    const schema = z.string().meta({ dependsOn: "breed=dog", label: "A" });
    expect(isFieldVisible(schema, { breed: "cat" })).toBe(false);
  });
  it("isFieldVisible H should handle field=value syntax with missing field", () => {
    const schema = z.string().meta({ dependsOn: "breed=dog", label: "A" });
    expect(isFieldVisible(schema, {})).toBe(false);
  });
  it("isFieldVisible I should handle field=value syntax with numeric values", () => {
    const schema = z.string().meta({ dependsOn: "age=5", label: "A" });
    expect(isFieldVisible(schema, { age: 5 })).toBe(true);
  });
  it("isFieldVisible J should handle metatada visible returning false", () => {
    const schema = z.string().meta({ isVisible: () => false, label: "A" });
    expect(isFieldVisible(schema, {})).toBe(false);
  });
  it("isFieldVisible K should handle field!=value syntax with matching value (should be hidden)", () => {
    const schema = z.string().meta({ dependsOn: "breed!=dog", label: "A" });
    expect(isFieldVisible(schema, { breed: "dog" })).toBe(false);
  });
  it("isFieldVisible L should handle field!=value syntax with non-matching value (should be visible)", () => {
    const schema = z.string().meta({ dependsOn: "breed!=dog", label: "A" });
    expect(isFieldVisible(schema, { breed: "cat" })).toBe(true);
  });
  it("isFieldVisible M should handle field!=value syntax with missing field", () => {
    const schema = z.string().meta({ dependsOn: "breed!=dog", label: "A" });
    expect(isFieldVisible(schema, {})).toBe(true);
  });
  it("isFieldVisible N should handle field!=value syntax with numeric values", () => {
    const schema = z.string().meta({ dependsOn: "age!=5", label: "A" });
    expect(isFieldVisible(schema, { age: 5 })).toBe(false);
    expect(isFieldVisible(schema, { age: 10 })).toBe(true);
  });
  it("isFieldVisible O should handle mixed = and != operators in array", () => {
    const schema = z.string().meta({ dependsOn: ["type=premium", "status!=inactive"], label: "A" });
    expect(isFieldVisible(schema, { status: "active", type: "premium" })).toBe(true);
    expect(isFieldVisible(schema, { status: "inactive", type: "premium" })).toBe(false);
    expect(isFieldVisible(schema, { status: "active", type: "basic" })).toBe(false);
  });

  // parseDependsOn
  it("parseDependsOn A should parse simple field name", () => {
    const result = parseDependsOn("fieldName");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "fieldName": "fieldName",
        },
      ]
    `);
  });
  it("parseDependsOn B should parse field=value syntax", () => {
    const result = parseDependsOn("breed=dog");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "expectedValue": "dog",
          "fieldName": "breed",
          "operator": "=",
        },
      ]
    `);
  });
  it("parseDependsOn C should handle field names with special characters", () => {
    const result = parseDependsOn("userEmail=test@example.com");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "expectedValue": "test@example.com",
          "fieldName": "userEmail",
          "operator": "=",
        },
      ]
    `);
  });
  it("parseDependsOn D should parse multiple field names", () => {
    const result = parseDependsOn(["fieldName", "fieldName2"]);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "fieldName": "fieldName",
        },
        {
          "fieldName": "fieldName2",
        },
      ]
    `);
  });
  it("parseDependsOn E should parse field!=value syntax", () => {
    const result = parseDependsOn("breed!=dog");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "expectedValue": "dog",
          "fieldName": "breed",
          "operator": "!=",
        },
      ]
    `);
  });
  it("parseDependsOn F should handle field names with special characters using !=", () => {
    const result = parseDependsOn("userEmail!=test@example.com");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "expectedValue": "test@example.com",
          "fieldName": "userEmail",
          "operator": "!=",
        },
      ]
    `);
  });
  it("parseDependsOn G should parse mixed operators in array", () => {
    const result = parseDependsOn(["type=premium", "status!=inactive"]);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "expectedValue": "premium",
          "fieldName": "type",
          "operator": "=",
        },
        {
          "expectedValue": "inactive",
          "fieldName": "status",
          "operator": "!=",
        },
      ]
    `);
  });

  // filterSchema
  it("filterSchema A should filter out fields not visible", () => {
    const shape = {
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ dependsOn: "a", label: "B" }),
    };
    const schema = z.object(shape);
    const filtered = filterSchema(schema, { a: "something" });
    expect(filtered.shape).toHaveProperty("a");
    expect(filtered.shape).toHaveProperty("b");
    const filtered2 = filterSchema(schema, {});
    expect(filtered2.shape).toHaveProperty("a");
    expect(filtered2.shape).not.toHaveProperty("b");
  });
  it("filterSchema B should filter out section fields", () => {
    const shape = {
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ label: "B", render: "section" }),
    };
    const schema = z.object(shape);
    const filtered = filterSchema(schema, { a: "something" });
    expect(filtered.shape).toHaveProperty("a");
    expect(filtered.shape).not.toHaveProperty("b");
  });

  // normalizeDataForSchema
  it("normalizeDataForSchema A should remove excluded fields and invisible fields", () => {
    const shape = {
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ excluded: true, label: "B" }),
      c: z.string().meta({ dependsOn: "a", label: "C" }),
    };
    const schema = z.object(shape);
    const data = { a: "foo", b: "bar", c: "baz" };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "a": "foo",
        "c": "baz",
      }
    `);
  });
  it("normalizeDataForSchema B should handle missing fieldSchema and metadata", () => {
    const schema = z.object({});
    const data = { x: 1 };
    expect(normalizeDataForSchema(schema, data)).toEqual({ x: 1 });
  });
  it("normalizeDataForSchema C should apply keyOut mapping when provided", () => {
    const schema = z.object({
      anotherField: z.string().meta({ label: "Another" }),
      internalName: z.string().meta({ keyOut: "externalName", label: "Name" }),
    });
    const data = { anotherField: "bar", internalName: "foo" };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "anotherField": "bar",
        "externalName": "foo",
      }
    `);
  });
  it("normalizeDataForSchema D should use key mapping for both in and out when key is provided", () => {
    const schema = z.object({
      internalName: z.string().meta({ key: "mappedName", label: "Name" }),
    });
    const data = { internalName: "foo" };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "mappedName": "foo",
      }
    `);
  });
  it("normalizeDataForSchema E should handle nested key mapping with dots in keyOut", () => {
    const schema = z.object({
      userEmail: z.string().meta({ keyOut: "user.contact.email", label: "Email" }),
      userName: z.string().meta({ keyOut: "user.info.name", label: "Name" }),
    });
    const data = {
      userEmail: "jane@example.com",
      userName: "Jane Doe",
    };
    const result = normalizeDataForSchema(schema, data);
    expect(result).toMatchInlineSnapshot(`
      {
        "user": {
          "contact": {
            "email": "jane@example.com",
          },
          "info": {
            "name": "Jane Doe",
          },
        },
      }
    `);
  });
  it("normalizeDataForSchema F should handle mixed nested and flat key mappings", () => {
    const schema = z.object({
      age: z.number().meta({ label: "Age" }),
      userEmail: z.string().meta({ keyOut: "user.email", label: "Email" }),
    });
    const data = {
      age: 30,
      userEmail: "test@example.com",
    };
    const result = normalizeDataForSchema(schema, data);
    expect(result).toMatchInlineSnapshot(`
      {
        "age": 30,
        "user": {
          "email": "test@example.com",
        },
      }
    `);
  });
  it("normalizeDataForSchema G should handle section fields", () => {
    const shape = {
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ label: "B", render: "section" }),
    };
    const schema = z.object(shape);
    const data = { a: "something", b: "something" };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "a": "something",
      }
    `);
  });
  it("normalizeDataForSchema H should handle metadata visible returning false", () => {
    const schema = z.object({ a: z.string().meta({ isVisible: () => false, label: "A" }) });
    const data = { a: "something" };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`{}`);
  });
  it("normalizeDataForSchema I should handle codec", () => {
    const schema = z.object({
      date: field(z.string(), { label: "Date", codec: isoDateStringToDateInstance }),
      userDate: field(z.string(), {
        keyOut: "user.date",
        label: "Date",
        codec: isoDateStringToDateInstance,
      }),
    });
    const data = {
      date: new Date("2026-01-14"),
      userDate: new Date("2026-01-14"),
    };
    const result = normalizeDataForSchema(schema, data);
    expect(result).toMatchInlineSnapshot(`
      {
        "date": "2026-01-14",
        "user": {
          "date": "2026-01-14",
        },
      }
    `);
  });
  it("normalizeDataForSchema J should handle ZodArray", () => {
    const schema = z.object({ a: z.array(z.string()).meta({ label: "A" }) });
    const data = { a: ["foo", "bar"] };
    const cleaned = normalizeDataForSchema(schema, data);
    expect(cleaned).toMatchInlineSnapshot(`
      {
        "a": [
          "foo",
          "bar",
        ],
      }
    `);
  });
  it("normalizeDataForSchema K should handle array with codec", () => {
    const schema = z.object({
      userDates: z.array(
        z
          .object({
            date: field(z.string(), { label: "Date", codec: isoDateStringToDateInstance }),
            userDate: field(z.string(), {
              keyOut: "user.date",
              label: "Date",
              codec: isoDateStringToDateInstance,
            }),
          })
          .optional(),
      ),
    });
    const data = {
      userDates: [
        {
          date: new Date("2026-01-14"),
          userDate: new Date("2026-01-14"),
        },
      ],
    };
    const result = normalizeDataForSchema(schema, data);
    expect(result).toMatchInlineSnapshot(`
      {
        "userDates": [
          {
            "date": "2026-01-14",
            "userDate": "2026-01-14",
          },
        ],
      }
    `);
  });

  // getKeyMapping
  it("getKeyMapping A should return undefined for both when no metadata", () => {
    const result = getKeyMapping();
    expect(result).toMatchInlineSnapshot(`
      {
        "keyIn": undefined,
        "keyOut": undefined,
      }
    `);
  });
  it("getKeyMapping B should use key for both keyIn and keyOut when key is provided", () => {
    const result = getKeyMapping({ key: "mappedKey" });
    expect(result).toMatchInlineSnapshot(`
      {
        "keyIn": "mappedKey",
        "keyOut": "mappedKey",
      }
    `);
  });
  it("getKeyMapping C should use keyIn and keyOut when provided separately", () => {
    const result = getKeyMapping({ keyIn: "inputKey", keyOut: "outputKey" });
    expect(result).toMatchInlineSnapshot(`
      {
        "keyIn": "inputKey",
        "keyOut": "outputKey",
      }
    `);
  });
  it("getKeyMapping D should prioritize keyIn and keyOut over key", () => {
    const result = getKeyMapping({ key: "mappedKey", keyIn: "inputKey", keyOut: "outputKey" });
    expect(result).toMatchInlineSnapshot(`
      {
        "keyIn": "inputKey",
        "keyOut": "outputKey",
      }
    `);
  });

  // mapExternalDataToFormFields
  it("mapExternalDataToFormFields A should map data using keyIn metadata", () => {
    const schema = z.object({
      age: z.number().meta({ label: "Age" }),
      internalName: z.string().meta({ keyIn: "externalName", label: "Name" }),
    });
    const externalData = { age: 30, externalName: "John" };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "age": 30,
        "internalName": "John",
      }
    `);
  });
  it("mapExternalDataToFormFields B should use field name when no keyIn provided", () => {
    const schema = z.object({
      age: z.number().meta({ label: "Age" }),
      name: z.string().meta({ label: "Name" }),
    });
    const externalData = { age: 30, name: "John" };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "age": 30,
        "name": "John",
      }
    `);
  });
  it("mapExternalDataToFormFields C should skip fields not in external data", () => {
    const schema = z.object({
      age: z.number().meta({ label: "Age" }),
      name: z.string().meta({ label: "Name" }),
    });
    const externalData = { name: "John" };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "name": "John",
      }
    `);
  });
  it("mapExternalDataToFormFields D should use key mapping for input when key is provided", () => {
    const schema = z.object({
      internalName: z.string().meta({ key: "mappedName", label: "Name" }),
    });
    const externalData = { mappedName: "John" };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "internalName": "John",
      }
    `);
  });
  it("mapExternalDataToFormFields E should handle fields without meta function", () => {
    const schema = z.object({
      age: z.number(),
      name: z.string(),
    });
    const externalData = { age: 30, name: "John" };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "age": 30,
        "name": "John",
      }
    `);
  });
  it("mapExternalDataToFormFields F should handle empty external data", () => {
    const schema = z.object({
      name: z.string().meta({ label: "Name" }),
    });
    const externalData = {};
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`{}`);
  });
  it("mapExternalDataToFormFields G should handle nested key mapping with dots in keyIn", () => {
    const schema = z.object({
      userEmail: z.string().meta({ keyIn: "user.contact.email", label: "Email" }),
      userName: z.string().meta({ keyIn: "user.info.name", label: "Name" }),
    });
    const externalData = {
      user: {
        contact: {
          email: "jane@example.com",
        },
        info: {
          name: "Jane Doe",
        },
      },
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "userEmail": "jane@example.com",
        "userName": "Jane Doe",
      }
    `);
  });
  it("mapExternalDataToFormFields H should handle mixed nested and flat key mappings", () => {
    const schema = z.object({
      age: z.number().meta({ label: "Age" }),
      userEmail: z.string().meta({ keyIn: "user.email", label: "Email" }),
    });
    const externalData = {
      age: 30,
      user: {
        email: "test@example.com",
      },
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "age": 30,
        "userEmail": "test@example.com",
      }
    `);
  });
  it("mapExternalDataToFormFields I should skip nested fields with undefined values", () => {
    const schema = z.object({
      userEmail: z.string().meta({ keyIn: "user.email", label: "Email" }),
      userName: z.string().meta({ keyIn: "user.name", label: "Name" }),
    });
    const externalData = {
      user: {
        email: "test@example.com",
      },
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "userEmail": "test@example.com",
      }
    `);
  });
  it("mapExternalDataToFormFields J should use codec", () => {
    const schema = z.object({
      date: field(z.string(), { label: "Date", codec: isoDateStringToDateInstance }),
      userDate: field(z.string(), { keyIn: "user.date", label: "Date", codec: isoDateStringToDateInstance }),
    });
    const externalData = {
      date: "2026-01-14",
      user: {
        date: "2026-01-14",
      },
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "date": 2026-01-14T00:00:00.000Z,
        "userDate": 2026-01-14T00:00:00.000Z,
      }
    `);
  });
  it("mapExternalDataToFormFields L should handle array using codec", () => {
    const schema = z.object({
      users: z.array(
        z.object({
          date: field(z.string(), { label: "Date", codec: isoDateStringToDateInstance }),
          userDate: field(z.string(), { label: "Date", codec: isoDateStringToDateInstance }),
        }),
      ),
    });
    const externalData = {
      users: [
        {
          date: "2026-01-14",
          userDate: "2026-01-14",
        },
      ],
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "users": [
          {
            "date": 2026-01-14T00:00:00.000Z,
            "userDate": 2026-01-14T00:00:00.000Z,
          },
        ],
      }
    `);
  });
  it("mapExternalDataToFormFields L should handle array using codec with optional", () => {
    const schema = z.object({
      users: z.array(field(z.string().optional(), { label: "Date", codec: isoDateStringToDateInstance })),
    });
    const externalData = {
      users: ["2026-01-14"],
    };
    const result = mapExternalDataToFormFields(schema, externalData);
    expect(result).toMatchInlineSnapshot(`
      {
        "users": [
          2026-01-14T00:00:00.000Z,
        ],
      }
    `);
  });

  // fields
  it("fields A should create a ZodArray", () => {
    const schema = fields(z.object({ name: z.string() }), {});
    expect(schema.type).toBe("array");
  });
  it("fields B should create a ZodArray with minItems", () => {
    const schema = fields(z.object({ name: z.string() }), { minItems: 1 });
    expect(schema.type).toBe("array");
    const parsed = schema.safeParse([{ name: "John" }, { name: "Jane" }, { name: "Jim" }]);
    expect(parsed.success).toBe(true);
    const parsed2 = schema.safeParse([]);
    expect(parsed2.success).toBe(false);
  });
  it("fields C should create a ZodArray with maxItems", () => {
    const schema = fields(z.object({ name: z.string() }), { maxItems: 1 });
    expect(schema.type).toBe("array");
    const parsed = schema.safeParse([{ name: "John" }]);
    expect(parsed.success).toBe(true);
    const parsed2 = schema.safeParse([{ name: "John" }, { name: "Jane" }]);
    expect(parsed2.success).toBe(false);
  });

  // isZodDate
  it("isZodDate A should detect ZodDate", () => {
    const schema = z.date();
    expect(isZodDate(schema)).toBe(true);
  });
  it("isZodDate B should detect optional ZodDate", () => {
    const schema = z.date().optional();
    expect(isZodDate(schema)).toBe(true);
  });
  it("isZodDate C should return false for non-date", () => {
    const schema = z.string();
    expect(isZodDate(schema)).toBe(false);
  });
  it("isZodString A should detect ZodString", () => {
    const schema = z.string();
    expect(isZodString(schema)).toBe(true);
  });
  it("isZodString B should detect optional ZodString", () => {
    const schema = z.string().optional();
    expect(isZodString(schema)).toBe(true);
  });
  it("isZodString C should return false for non-string", () => {
    const schema = z.number();
    expect(isZodString(schema)).toBe(false);
  });

  // normalizeData
  it("normalizeData A should clean data across multiple schemas", () => {
    const schema1 = z.object({
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ excluded: true, label: "B" }),
    });
    const schema2 = z.object({
      c: z.string().meta({ dependsOn: "a", label: "C" }),
    });
    const data = { a: "foo", b: "bar", c: "baz" };
    const cleaned = normalizeData([schema1, schema2], data);
    expect(cleaned).toEqual({ a: "foo", c: "baz" });
  });
  it("normalizeData B should handle empty schemas array", () => {
    const data = { a: "foo" };
    const cleaned = normalizeData([], data);
    expect(cleaned).toEqual(data);
  });

  // filterDataForSummary
  it("filterDataForSummary A should filter out fields from readonly steps", () => {
    const schema1 = z.object({ a: z.string().meta({ label: "A" }) }).meta({ state: "readonly" });
    const schema2 = z.object({ b: z.string().meta({ label: "B" }) }).meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema1, schema2], data);
    expect(filtered).toEqual({ b: "bar" });
  });
  it("filterDataForSummary B should filter out fields from upcoming steps", () => {
    const schema1 = z.object({ a: z.string().meta({ label: "A" }) }).meta({ state: "upcoming" });
    const schema2 = z.object({ b: z.string().meta({ label: "B" }) }).meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema1, schema2], data);
    expect(filtered).toEqual({ b: "bar" });
  });
  it("filterDataForSummary C should filter out invisible and excluded fields", () => {
    const schema = z
      .object({
        a: z.string().meta({ label: "A" }),
        b: z.string().meta({ excluded: true, label: "B" }),
        c: z.string().meta({ dependsOn: "a", label: "C" }),
      })
      .meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });
  it("filterDataForSummary D should include fields from editable steps", () => {
    const schema = z
      .object({
        a: z.string().meta({ label: "A" }),
        b: z.string().meta({ label: "B" }),
      })
      .meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo", b: "bar" });
  });
  it("filterDataForSummary E should handle steps without metadata", () => {
    const schema = z.object({
      a: z.string().meta({ label: "A" }),
    });
    const data = { a: "foo" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });
  it("filterDataForSummary F should handle sections", () => {
    const schema = z.object({
      a: z.string().meta({ label: "A" }),
      b: section({ title: "B Section" }),
    });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });

  // sectionsFromEditableSteps
  it("sectionsFromEditableSteps A should skip readonly and upcoming steps", () => {
    const schema1 = z
      .object({
        a: z.string().meta({ label: "A" }),
      })
      .meta({ state: "readonly" });
    const schema2 = z
      .object({
        b: z.string().meta({ label: "B" }),
      })
      .meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema1, schema2], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({ b: { label: "B", value: "bar" } });
  });
  it("sectionsFromEditableSteps B should handle steps without sections", () => {
    const schema = z
      .object({
        a: z.string().meta({ label: "A" }),
        b: z.string().meta({ label: "B" }),
      })
      .meta({ state: "editable" });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({
      a: { label: "A", value: "foo" },
      b: { label: "B", value: "bar" },
    });
  });
  it("sectionsFromEditableSteps C should handle sections", () => {
    const schema = z.object({
      a: z.string().meta({ label: "A" }),
      b: section({ title: "B Section" }),
      c: section({}),
    });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps D should handle invisible fields", () => {
    const schema = z.object({
      a: z.string().meta({ label: "A" }),
      b: z.string().meta({ isVisible: () => false, label: "B" }),
    });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
  });

  // getFieldMetadata
  it("getFieldMetadata A should return metadata when present", () => {
    const schema = z.string().meta({ label: "Test" });
    const metadata = getFieldMetadata(schema);
    expect(metadata).toEqual({ label: "Test" });
  });
  it("getFieldMetadata B should return undefined when no metadata", () => {
    const schema = z.string();
    const metadata = getFieldMetadata(schema);
    expect(metadata).toBeUndefined();
  });
  it("getFieldMetadata C should return undefined when schema is undefined", () => {
    const metadata = getFieldMetadata(undefined);
    expect(metadata).toBeUndefined();
  });
  it("getFieldMetadata D should return undefined when meta is not a function", () => {
    const schema = { type: "string" } as z.ZodType;
    const metadata = getFieldMetadata(schema);
    expect(metadata).toBeUndefined();
  });

  // getFieldMetadataOrThrow
  it("getFieldMetadataOrThrow A should return metadata when present", () => {
    const schema = z.string().meta({ label: "Test" });
    const metadata = getFieldMetadataOrThrow("testField", schema);
    expect(metadata).toEqual({ label: "Test" });
  });
  it("getFieldMetadataOrThrow B should throw when metadata is missing", () => {
    const schema = z.string();
    expect(() => getFieldMetadataOrThrow("testField", schema)).toThrow('Field "testField" is missing metadata');
  });
  it("getFieldMetadataOrThrow C should throw when schema is section metadata", () => {
    const schema = section({ title: "Section" });
    expect(() => getFieldMetadataOrThrow("testField", schema)).toThrow('Cannot render field "testField" with section metadata');
  });

  // field
  it("field A should add metadata to schema", () => {
    const schema = field(z.string(), { label: "Test Field" });
    const metadata = getFieldMetadata(schema);
    expect(metadata).toEqual({ label: "Test Field" });
  });
  it("field B should preserve schema type", () => {
    const schema = field(z.number(), { label: "Number Field" });
    expect(isZodNumber(schema)).toBe(true);
  });

  // section
  it("section A should create section schema with metadata", () => {
    const schema = section({ title: "Test Section" });
    const metadata = getFieldMetadata(schema);
    expect(metadata).toEqual({ render: "section", title: "Test Section" });
  });
  it("section B should create optional string schema", () => {
    const schema = section({ title: "Test Section" });
    expect(schema.type).toBe("optional");
    const parsed = schema.safeParse(undefined);
    expect(parsed.success).toBe(true);
  });

  // getStepMetadata
  it("getStepMetadata A should return metadata when present", () => {
    const schema = z.object({}).meta({ title: "Test Step" });
    const metadata = getStepMetadata(schema);
    expect(metadata).toEqual({ title: "Test Step" });
  });
  it("getStepMetadata B should return undefined when no metadata", () => {
    const schema = z.object({});
    const metadata = getStepMetadata(schema);
    expect(metadata).toBeUndefined();
  });
  it("getStepMetadata C should return undefined when meta is not a function", () => {
    const schema = { shape: {} } as z.ZodObject;
    const metadata = getStepMetadata(schema);
    expect(metadata).toBeUndefined();
  });

  // step
  it("step A should add metadata to schema when provided", () => {
    const baseSchema = z.object({ name: z.string() });
    const schema = step(baseSchema, { title: "Test Step" });
    const metadata = getStepMetadata(schema);
    expect(metadata).toEqual({ title: "Test Step" });
  });
  it("step B should return schema unchanged when no metadata", () => {
    const baseSchema = z.object({ name: z.string() });
    const schema = step(baseSchema);
    expect(schema).toBe(baseSchema);
  });

  // forms
  it("forms A should create a ZodArray with metadata", () => {
    const schema = forms(z.object({ name: z.string() }), { icon: createElement("div"), maxItems: 3, minItems: 1 });
    expect(schema.type).toBe("array");
    const metadata = getFieldMetadata(schema);
    expect(metadata).toBeDefined();
    if (metadata) {
      expect(metadata.render).toBe("form-list");
      expect("minItems" in metadata && metadata.minItems).toBe(1);
      expect("maxItems" in metadata && metadata.maxItems).toBe(3);
    }
  });
  it("forms B should validate array constraints", () => {
    const schema = forms(z.object({ name: z.string() }), { icon: createElement("div"), maxItems: 2, minItems: 1 });
    const parsed = schema.safeParse([{ name: "John" }]);
    expect(parsed.success).toBe(true);
    const parsed2 = schema.safeParse([]);
    expect(parsed2.success).toBe(false);
    const parsed3 = schema.safeParse([{ name: "John" }, { name: "Jane" }, { name: "Jim" }]);
    expect(parsed3.success).toBe(false);
  });

  // getFormFieldRender
  it("getFormFieldRender A should return explicit render from metadata", () => {
    const schema = z.string().meta({ render: "form-list" });
    expect(getFormFieldRender(schema)).toBe("form-list");
  });
  it("getFormFieldRender B should return upload for file schema", () => {
    const schema = z.file();
    expect(getFormFieldRender(schema)).toBe("upload");
  });
  it("getFormFieldRender C should return date for date schema", () => {
    const schema = z.date();
    expect(getFormFieldRender(schema)).toBe("date");
  });
  it("getFormFieldRender D should return select for enum schema", () => {
    const schema = z.enum(["a", "b"]);
    expect(getFormFieldRender(schema)).toBe("select");
  });
  it("getFormFieldRender E should return number for number schema", () => {
    const schema = z.number();
    expect(getFormFieldRender(schema)).toBe("number");
  });
  it("getFormFieldRender F should return boolean for boolean schema", () => {
    const schema = z.boolean();
    expect(getFormFieldRender(schema)).toBe("boolean");
  });
  it("getFormFieldRender G should return text for string schema", () => {
    const schema = z.string();
    expect(getFormFieldRender(schema)).toBe("text");
  });
  it("getFormFieldRender H should return undefined for unknown schema", () => {
    const schema = z.object({});
    expect(getFormFieldRender(schema)).toBeUndefined();
  });
  it("getFormFieldRender I should handle optional schemas", () => {
    const schema = z.string().optional();
    expect(getFormFieldRender(schema)).toBe("text");
  });

  // mockSubmit
  it("mockSubmit A should return submission with warning status", async () => {
    const result = await mockSubmit("warning", "Test message");
    expect(result.submission.status).toBe("warning");
    expect(result.submission.children).toBe("Test message");
    expect(result.submission.detailsList).toEqual(["Some fields have warnings.", "Submission is complete anyway."]);
  });
  it("mockSubmit B should return submission with success status", async () => {
    const result = await mockSubmit("success", "Success message");
    expect(result.submission.status).toBe("success");
    expect(result.submission.children).toBe("Success message");
    expect(result.submission.detailsList).toEqual(["All data is valid.", "No errors found."]);
  });
  it("mockSubmit C should return submission with error status", async () => {
    const result = await mockSubmit("error", "Error message");
    expect(result.submission.status).toBe("error");
    expect(result.submission.children).toBe("Error message");
    expect(result.submission.detailsList).toEqual(["Network error occurred.", "Please retry submission."]);
  });
  it("mockSubmit D should return submission with loading status", async () => {
    const result = await mockSubmit("loading", "Loading message");
    expect(result.submission.status).toBe("loading");
    expect(result.submission.children).toBe("Loading message");
    expect(result.submission.detailsList).toEqual(["Network error occurred.", "Please retry submission."]);
  });
  it("mockSubmit E should return submission with unknown-error status", async () => {
    const result = await mockSubmit("unknown-error", "Unknown error message");
    expect(result.submission.status).toBe("unknown-error");
    expect(result.submission.children).toBe("Unknown error message");
    expect(result.submission.detailsList).toEqual(["Network error occurred.", "Please retry submission."]);
  });

  // getInitialStep
  const stepSchemas = [step(z.object(), { title: "Step 1", state: "readonly" }), step(z.object(), { title: "Step 2" }), step(z.object(), { title: "Step 3" })];

  it("getInitialStep A should return the first editable step if `showFirstEditableStep` is true", () => {
    expect(getInitialStep(stepSchemas, true)).toBe(1);
    expect(getInitialStep(stepSchemas, true, true)).toBe(1);
  });

  it("getInitialStep b should fallback to the first step if noting is editable", () => {
    const notEditableSchemas = [step(z.object(), { title: "Step 1", state: "readonly" }), step(z.object(), { title: "Step 1", state: "upcoming" })];
    expect(getInitialStep(notEditableSchemas, true)).toBe(0);
  });

  it("getInitialStep C should return the last step if `showLastStep` is true", () => {
    expect(getInitialStep(stepSchemas, false, true)).toBe(2);
  });

  it("getInitialStep D should return the first step as default step", () => {
    expect(getInitialStep(stepSchemas)).toBe(0);
  });

  // isZodArray
  it("isZodArray A should return true for ZodArray", () => {
    const schema = z.array(z.string());
    expect(isZodArray(schema)).toBe(true);
  });
  it("isZodArray B should return true for optional ZodArray", () => {
    const schema = z.array(z.string()).optional();
    expect(isZodArray(schema)).toBe(true);
  });
  it("isZodArray C should return false for non-array schema", () => {
    const schema = z.string();
    expect(isZodArray(schema)).toBe(false);
  });
  it("isZodArray D should return false for optional non-array schema", () => {
    const schema = z.string().optional();
    expect(isZodArray(schema)).toBe(false);
  });

  // getDefaultValues
  it("getDefaultValues A should compute default values from schemas", () => {
    const schema1 = z.object({ name: z.string().meta({ label: "Name" }) });
    const schema2 = z.object({ age: z.number().meta({ label: "Age" }) });
    const initialData = { age: 30, name: "John" };
    const result = getDefaultValues([schema1, schema2], initialData);
    expect(result).toEqual({ age: 30, name: "John" });
  });
  it("getDefaultValues B should handle keyIn mapping", () => {
    const schema = z.object({ userName: z.string().meta({ keyIn: "user.name", label: "Name" }) });
    const initialData = { user: { name: "Jane" } };
    const result = getDefaultValues([schema], initialData);
    expect(result).toEqual({ userName: "Jane" });
  });
  it("getDefaultValues C should handle empty initial data", () => {
    const schema = z.object({ name: z.string().meta({ label: "Name" }) });
    const result = getDefaultValues([schema], {});
    expect(result).toEqual({});
  });

  // getLastAccessibleStepIndex
  it("getLastAccessibleStepIndex A should return last non-upcoming step index", () => {
    const schemas = [step(z.object(), { state: "editable" }), step(z.object(), { state: "editable" }), step(z.object(), { state: "upcoming" })];
    expect(getLastAccessibleStepIndex(schemas)).toBe(1);
  });
  it("getLastAccessibleStepIndex B should return last index if no upcoming steps", () => {
    const schemas = [step(z.object(), { state: "editable" }), step(z.object(), { state: "readonly" })];
    expect(getLastAccessibleStepIndex(schemas)).toBe(1);
  });
  it("getLastAccessibleStepIndex C should return last index if all upcoming", () => {
    const schemas = [step(z.object(), { state: "upcoming" }), step(z.object(), { state: "upcoming" })];
    expect(getLastAccessibleStepIndex(schemas)).toBe(1);
  });

  // isStepClickable
  it("isStepClickable A should return false if submission status is success", () => {
    const schemas = [step(z.object(), { state: "editable" })];
    expect(isStepClickable(schemas, 0, "success")).toBe(false);
  });
  it("isStepClickable B should return false if submission status is warning", () => {
    const schemas = [step(z.object(), { state: "editable" })];
    expect(isStepClickable(schemas, 0, "warning")).toBe(false);
  });
  it("isStepClickable C should return false if step is upcoming", () => {
    const schemas = [step(z.object(), { state: "upcoming" })];
    expect(isStepClickable(schemas, 0)).toBe(false);
  });
  it("isStepClickable D should return true for editable step without submission", () => {
    const schemas = [step(z.object(), { state: "editable" })];
    expect(isStepClickable(schemas, 0)).toBe(true);
  });
  it("isStepClickable E should return true for readonly step", () => {
    const schemas = [step(z.object(), { state: "readonly" })];
    expect(isStepClickable(schemas, 0)).toBe(true);
  });

  // buildStepperSteps
  const mockIcons = { editable: createElement("span", {}, "edit"), readonly: createElement("span", {}, "read"), upcoming: createElement("span", {}, "up") };

  it("buildStepperSteps A should build steps from schemas", () => {
    const schemas = [step(z.object(), { title: "Step 1" }), step(z.object(), { title: "Step 2" })];
    const result = buildStepperSteps({ currentStep: 0, hasSubmission: false, icons: mockIcons, schemas, showSummary: false });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Step 1");
    expect(result[0].active).toBe(true);
    expect(result[1].title).toBe("Step 2");
    expect(result[1].active).toBe(false);
  });
  it("buildStepperSteps B should mark correct step as active", () => {
    const schemas = [step(z.object(), { title: "Step 1" }), step(z.object(), { title: "Step 2" })];
    const result = buildStepperSteps({ currentStep: 1, hasSubmission: false, icons: mockIcons, schemas, showSummary: false });
    expect(result[0].active).toBe(false);
    expect(result[1].active).toBe(true);
  });
  it("buildStepperSteps C should not mark any step active when showing summary", () => {
    const schemas = [step(z.object(), { title: "Step 1" })];
    const result = buildStepperSteps({ currentStep: 0, hasSubmission: false, icons: mockIcons, schemas, showSummary: true });
    expect(result[0].active).toBe(false);
  });
  it("buildStepperSteps D should not mark any step active when has submission", () => {
    const schemas = [step(z.object(), { title: "Step 1" })];
    const result = buildStepperSteps({ currentStep: 0, hasSubmission: true, icons: mockIcons, schemas, showSummary: false });
    expect(result[0].active).toBe(false);
  });
  it("buildStepperSteps E should use default title when not provided", () => {
    const schemas = [z.object()];
    const result = buildStepperSteps({ currentStep: 0, hasSubmission: false, icons: mockIcons, schemas, showSummary: false });
    expect(result[0].title).toBe("Step 1");
  });
  it("buildStepperSteps F should handle sections", () => {
    const schemas = [step(z.object(), { section: "Section A", title: "Step 1" }), step(z.object(), { section: "Section A", title: "Step 2" }), step(z.object(), { section: "Section B", title: "Step 3" })];
    const result = buildStepperSteps({ currentStep: 0, hasSubmission: false, icons: mockIcons, schemas, showSummary: false });
    expect(result[0].section).toBe("Section A");
    expect(result[1].section).toBeUndefined();
    expect(result[2].section).toBe("Section B");
  });
});
