import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { machine } from "./machine";
import { step1AnimalDetails, step2bTheDiet, step2CatDetails, step2DogDetails, step3Allergies } from "./schemas";

describe("book-appointment machine", () => {
  it("machine A empty input", () => {
    const actor = createActor(machine, { input: {} });
    actor.start();
    expect(actor.getSnapshot().context.schemas).toHaveLength(1);
    expect(actor.getSnapshot().context.schemas[0]).toBe(step1AnimalDetails);
  });
  it("machine B dog breed selected", () => {
    const actor = createActor(machine, {
      input: { formData: { breed: "dog" } },
    });
    actor.start();
    expect(actor.getSnapshot().context.schemas).toHaveLength(2);
    expect(actor.getSnapshot().context.schemas[0]).toBe(step1AnimalDetails);
    expect(actor.getSnapshot().context.schemas[1]).toBe(step2DogDetails);
  });
  it("machine C dog breed selected on diet", () => {
    const actor = createActor(machine, {
      input: { formData: { breed: "dog", onDiet: true } },
    });
    actor.start();
    expect(actor.getSnapshot().context.schemas).toHaveLength(3);
    expect(actor.getSnapshot().context.schemas[0]).toBe(step1AnimalDetails);
    expect(actor.getSnapshot().context.schemas[1]).toBe(step2DogDetails);
    expect(actor.getSnapshot().context.schemas[2]).toBe(step2bTheDiet);
  });
  it("machine D cat breed selected not on diet", () => {
    const actor = createActor(machine, {
      input: { formData: { breed: "cat", onDiet: false } },
    });
    actor.start();
    expect(actor.getSnapshot().context.schemas).toHaveLength(3);
    expect(actor.getSnapshot().context.schemas[0]).toBe(step1AnimalDetails);
    expect(actor.getSnapshot().context.schemas[1]).toBe(step2CatDetails);
    expect(actor.getSnapshot().context.schemas[2]).toBe(step3Allergies);
  });
  it("machine E dog breed selected on diet with diet frequency", () => {
    const actor = createActor(machine, {
      input: { formData: { breed: "dog", dietFrequency: "daily", onDiet: true } },
    });
    actor.start();
    expect(actor.getSnapshot().context.schemas).toHaveLength(4);
    expect(actor.getSnapshot().context.schemas[0]).toBe(step1AnimalDetails);
    expect(actor.getSnapshot().context.schemas[1]).toBe(step2DogDetails);
    expect(actor.getSnapshot().context.schemas[2]).toBe(step2bTheDiet);
    expect(actor.getSnapshot().context.schemas[3]).toBe(step3Allergies);
  });
});
