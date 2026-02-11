import { expectTypeOf } from "vitest";
import { randomBoolean, randomEmail, randomNumber, randomPerson, randomString } from "./random.js";

it("randomString A", () => {
  expect(randomString().length > 0).toBe(true);
});

it("randomBoolean A", () => {
  expectTypeOf(randomBoolean()).toBeBoolean();
});

it("randomEmail A random size", () => {
  const email = randomEmail("Michael", "Scott");
  expect(email.includes(".scott")).toBe(true);
});

it("randomEmail B short", () => {
  const email = randomEmail("Michael", "Scott", true);
  expect(email.startsWith("m.")).toBe(true);
});

it("randomEmail C short no firstname", () => {
  const email = randomEmail("", "Scott", true);
  expect(email.startsWith("scott@")).toBe(true);
});

it("randomPerson A", () => {
  const person = randomPerson();
  expect(person.email.includes(".")).toBe(true);
});

it("randomNumber 0 min by default", () => {
  expect(randomNumber() >= 0).toBe(true);
});
it("randomNumber 100 max by default", () => {
  expect(randomNumber() <= 100).toBe(true);
});
it("randomNumber between 22 & 122", () => {
  expect(randomNumber(22, 122) <= 122).toBe(true);
});
it("randomNumber between 42 & 42", () => {
  expect(randomNumber(42, 42)).toBe(42);
});
