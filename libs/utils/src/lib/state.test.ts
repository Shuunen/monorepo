import { createState } from "./state.js";
import { storage } from "./storage.js";

const { state: stateA, watchState: watchStateA } = createState({ age: 30, name: "Michael" });

it("state A initial data", () => {
  expect(stateA).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "Michael",
    }
  `);
});

it("state A name change", () => {
  stateA.name = "John";
  expect(stateA).toMatchInlineSnapshot(`
    {
      "age": 30,
      "name": "John",
    }
  `);
});

it("state A watch callback", () => {
  let callbackCalls = 0;
  /**
   *
   */
  function callback() {
    callbackCalls += 1;
  }
  watchStateA("name", callback);
  expect(callbackCalls, "callback not called yet").toBe(0);
  stateA.name = "Martin";
  expect(callbackCalls, "callback called once").toBe(1);
  stateA.name = "Josh";
  expect(callbackCalls, "callback called twice").toBe(2);
  stateA.age = 33;
  expect(callbackCalls, "callback not called when age changed").toBe(2);
});

it("state B with storage and specific keys to store", () => {
  // biome-ignore lint/style/useNamingConvention: for testing purposes
  storage.media = { stateB_age: 12, stateB_excluded: ":(" } as unknown as Storage;
  storage.prefix = "stateB_";
  const { state: stateB } = createState({ age: 42, excluded: ":)", name: "Clara" }, storage, ["name", "age"]);
  expect(stateB.name, "name loaded from initial data because not in storage").toBe("Clara");
  expect(stateB.age, "age loaded from storage that takes precedence over initial data because it is in the sync props").toBe(12);
  expect(stateB.excluded, "excluded loaded from initial data event if present in storage, because it was not in the synced props").toBe(":)");
  stateB.name = "John";
  expect(stateB.name, "name changed in state").toBe("John");
  expect(storage.media.stateB_name, "name synced in storage").toBe("John");
});

it("state C with storage and all keys stored by default", () => {
  // biome-ignore lint/style/useNamingConvention: for testing purposes
  storage.media = { stateC_age: 12, stateC_included: ":D" } as unknown as Storage;
  storage.prefix = "stateC_";
  const { state: stateC } = createState({ age: 42, included: "but im gonna be ignored :(" }, storage);
  expect(stateC.age, "age loaded from storage that takes precedence over initial data because it is in the sync props").toBe(12);
  expect(stateC.included, "included loaded from storage that takes precedence over initial data because it is in the sync props").toBe(":D");
  stateC.age = 14;
  expect(stateC.age, "age changed in state").toBe(14);
  expect(storage.get("age"), "age synced in storage").toMatchInlineSnapshot(`14`);
});

it("state D multiple watch", () => {
  let callbackCalls = 0;
  /**
   *
   */
  function callbackA() {
    callbackCalls += 1;
  }
  watchStateA(["name", "age"], callbackA);
  expect(callbackCalls, "callback A not called yet").toBe(0);
  stateA.name = "Martin";
  expect(callbackCalls, "callback A called once").toBe(1);
  stateA.age = 33;
  expect(callbackCalls, "callback A called twice").toBe(2);
});

it("state E watch all", () => {
  let callbackCalls = 0;
  let callbackKey = "";
  /**
   * @param updatedKey the key that has been updated
   */
  function callbackB(updatedKey: string) {
    callbackCalls += 1;
    callbackKey = updatedKey;
  }
  watchStateA("*", callbackB);
  expect(callbackCalls, "callback B not called yet").toBe(0);
  stateA.name = "Martin";
  expect(callbackCalls, "callback B called once").toBe(1);
  expect(callbackKey, "callback B called with name key").toBe("name");
  stateA.age = 33;
  expect(callbackCalls, "callback B called twice").toBe(2);
  expect(callbackKey, "callback B called with age key").toBe("age");
});
