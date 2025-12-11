import { hasOwn } from "./functions.js";
import { storage } from "./storage.js";

type User = {
  age: number;
  name: string;
};

const key = "Michael";
storage.media = {} as Storage;

const returnTestA = storage.get(key);
it("storage returnTestA", () => {
  expect(returnTestA).toBe(undefined);
});
it("storage typeof returnTestA", () => {
  expect(typeof returnTestA).toBe("undefined");
});

const returnTestB = storage.get(key, "default");
it("storage returnTestB", () => {
  expect(returnTestB).toBe("default");
});

const returnTestC = storage.get<User>(key);
it("storage returnTestC", () => {
  expect(returnTestC).toMatchInlineSnapshot(`undefined`);
});

const returnTestD = storage.get<User>(key, { age: 0, name: "default" });
it("storage returnTestD", () => {
  expect(returnTestD).toStrictEqual({ age: 0, name: "default" });
});

const isReturnTestE = storage.get(key, true);
it("storage returnTestE", () => {
  expect(isReturnTestE).toBe(true);
});

const returnTestF = storage.get<number>(key);
it("storage returnTestF", () => {
  expect(returnTestF).toMatchInlineSnapshot(`undefined`);
});

it("storage get without default value", () => {
  expect(storage.get(key)).toBe(undefined);
});

it("storage has no value for key", () => {
  expect(storage.has(key)).toBe(false);
});
it("storage set string value for key", () => {
  expect(storage.set(key, "Flax")).toBe("Flax");
});
it("storage has string value for key", () => {
  expect(storage.has(key)).toBe(true);
});

it("storage set object value for key", () => {
  expect(storage.set(key, { age: 30, name: "Michael" })).toStrictEqual({ age: 30, name: "Michael" });
});
it("storage get object value for key", () => {
  expect(storage.get<User>(key)).toStrictEqual({ age: 30, name: "Michael" });
});

it("storage set number value for key", () => {
  expect(storage.set(key, 30)).toBe(30);
});
it("storage get number value for key", () => {
  expect(storage.get<number>(key)).toBe(30);
});

it("storage set boolean value for key", () => {
  expect(storage.set(key, true)).toBe(true);
});
it("storage get boolean value for key", () => {
  expect(storage.get<boolean>(key)).toBe(true);
});

it("storage set array value for key", () => {
  expect(storage.set(key, [1, 2, 3])).toStrictEqual([1, 2, 3]);
});
it("storage get array value for key", () => {
  expect(storage.get<number[]>(key)).toStrictEqual([1, 2, 3]);
});

it("storage clear value for key", () => {
  expect(storage.clear(key)).toBe(undefined);
});

it("storage get return undefined when key is not found", () => {
  expect(storage.get<User>("John")).toMatchInlineSnapshot(`undefined`);
});

it("storage get default value when key is not found", () => {
  expect(storage.get<User>("John", { age: 30, name: "John" })).toStrictEqual({ age: 30, name: "John" });
});

it("storage get default value when key is found but empty string", () => {
  expect(storage.get("myKey", "default")).toStrictEqual("default");
});

storage.prefix = "test-";
it("storage prefix is set", () => {
  expect(storage.prefix).toBe("test-");
});
it("storage set string value for key with prefix", () => {
  expect(storage.set(key, "Hudson")).toBe("Hudson");
});
it("storage get string value for key with prefix", () => {
  expect(storage.get<string>(key)).toBe("Hudson");
});
it("storage has string value for key with prefix", () => {
  expect(storage.has(key)).toBe(true);
});
it("storage contains a prefixed key", () => {
  expect(hasOwn(storage.media, "test-Michael")).toBe(true);
});
it("storage clear value for key with prefix", () => {
  expect(storage.clear(key)).toBe(undefined);
});

const returnA = storage.get(key);
it("storage typeof returnA is undefined and TS inferred type should be unknown", () => {
  expect(typeof returnA).toBe("undefined");
});

const returnB = storage.get(key, "default");
it("storage typeof returnB is string and TS inferred type should be string", () => {
  expect(typeof returnB).toBe("string");
});

const returnC = storage.get<User>(key);
it("storage typeof returnC is undefined and TS inferred type should be User | undefined", () => {
  expect(typeof returnC).toBe("undefined");
});

const returnD = storage.get<User>(key, { age: 0, name: "default" });
it("storage typeof returnD is object and TS inferred type should be User", () => {
  expect(typeof returnD).toBe("object");
});

const returnE = storage.get(key, true);
it("storage typeof returnE is boolean and TS inferred type should be boolean", () => {
  expect(typeof returnE).toBe("boolean");
});

const returnF = storage.get<number>(key);
it("storage typeof returnF is undefined and TS inferred type should be number | undefined", () => {
  expect(typeof returnF).toBe("undefined");
});

const returnG = storage.get(key, 12);
it("storage typeof returnG is number and TS inferred type should be number", () => {
  expect(typeof returnG).toBe("number");
});

const returnH = storage.get(key, [1, 2, 3]);
it("storage typeof returnH is object and TS inferred type should be number[]", () => {
  expect(typeof returnH).toBe("object");
});

const returnI = storage.get<number>(key, 24);
it("storage typeof returnI is number and TS inferred type should be number", () => {
  expect(typeof returnI).toBe("number");
});
