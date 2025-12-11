import { z } from "zod";
import { numberSchema, optionalNumberSchema, zodSnap } from "./zod.js";

describe("zod", () => {
  it("zodSnap A invalid email", () => {
    const schema = z.email();
    const result = schema.safeParse("not an email");
    const message = zodSnap(result.error);
    expect(message).toMatchInlineSnapshot(`
      [
        " | invalid_format | Invalid email address",
      ]
    `);
  });

  it("zodSnap B valid email", () => {
    const schema = z.email();
    const result = schema.safeParse("mr-clean@yopmail.fr");
    const message = zodSnap(result.error);
    expect(message).toMatchInlineSnapshot(`undefined`);
  });
});

describe("numberSchema", () => {
  it("empty options, with valid string", () => {
    const schema = numberSchema();
    expect(schema.safeParse("12").success).toBe(true);
  });

  it("min only with valid string in range ", () => {
    const schema = numberSchema({ min: 1 });
    expect(schema.safeParse("12").success).toBe(true);
  });

  it("min only with valid string outside range ", () => {
    const schema = numberSchema({ min: 1 });
    expect(schema.safeParse("-1").success).toBe(false);
  });
  it("max only with valid string in range ", () => {
    const schema = numberSchema({ max: 20 });
    expect(schema.safeParse("12").success).toBe(true);
  });
  it("max only with valid string outside range ", () => {
    const schema = numberSchema({ max: 20 });
    expect(schema.safeParse("21").success).toBe(false);
  });
  it("min/max only with valid string in range ", () => {
    const schema = numberSchema({ max: 20, min: 10 });
    expect(schema.safeParse("12").success).toBe(true);
  });
  it("min/max only with valid string outside range ", () => {
    const schema = numberSchema({ max: 20, min: 10 });
    expect(schema.safeParse("2").success).toBe(false);
  });
  it("empty with invalid string  ", () => {
    const schema = numberSchema();
    expect(schema.safeParse("leet").success).toBe(false);
  });
});

describe("optionalNumberSchema", () => {
  it("undefined, with valid string", () => {
    const schema = optionalNumberSchema();
    expect(schema.safeParse(undefined).success).toBe(true);
  });
  it("empty string, with valid string", () => {
    const schema = optionalNumberSchema();
    expect(schema.safeParse("").success).toBe(true);
  });

  it("min only with valid string in range ", () => {
    const schema = optionalNumberSchema({ min: 1 });
    expect(schema.safeParse("12").success).toBe(true);
  });

  it("min only with valid string outside range ", () => {
    const schema = optionalNumberSchema({ min: 1 });
    expect(schema.safeParse("-1").success).toBe(false);
  });
  it("max only with valid string in range ", () => {
    const schema = numberSchema({ max: 20 });
    expect(schema.safeParse("12").success).toBe(true);
  });
  it("max only with valid string outside range ", () => {
    const schema = optionalNumberSchema({ max: 20 });
    expect(schema.safeParse("21").success).toBe(false);
  });
  it("min/max only with valid string in range ", () => {
    const schema = numberSchema({ max: 20, min: 10 });
    expect(schema.safeParse("12").success).toBe(true);
  });
  it("min/max only with valid string outside range ", () => {
    const schema = numberSchema({ max: 20, min: 10 });
    expect(schema.safeParse("2").success).toBe(false);
  });
  it("empty with invalid string  ", () => {
    const schema = optionalNumberSchema();
    expect(schema.safeParse("leet").success).toBe(false);
  });
});
