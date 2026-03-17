import { clone } from "./object-clone.ts";
import { objectEqual } from "./object-equal.ts";
import { objectSum } from "./object-sum.ts";

describe(clone, () => {
  const person = {
    age: 21,
    details: { dateOfBirth: new Date("2001-12-22"), favouriteFood: "sushi" },
    name: "John",
    nameRegex: /^jo/iu,
    nameValid: true,
    nameValidator: (input: string) => input.length > 3,
  };
  const personClone = clone(person);
  const personCloneModified = clone(person);
  personCloneModified.age = 42;
  it("clone A record", () => {
    expect(personCloneModified.age).toBe(42);
  });
  it("clone B record does not affect the original one", () => {
    expect(person.age).toBe(21);
  });

  const persons = ["John", "Fanny"];
  const personsCopy = clone(persons);
  personsCopy[1] = "Bob";
  it("clone C array", () => {
    expect(personsCopy[1]).toBe("Bob");
  });
  it("clone D array does not affect the original one", () => {
    expect(persons[1]).toBe("Fanny");
  });
  it("clone E original and clone are have the same objectSum", () => {
    expect(objectSum(person)).toBe(objectSum(personClone));
  });
  it("clone F original and clone are equals via objectEqual", () => {
    expect(objectEqual(person, personClone)).toBe(true);
  });
  it("clone G two clones are equals via objectEqual", () => {
    expect(objectEqual(clone(person), clone(person))).toBe(true);
  });
  it("clone H cloned values keep their type", () => {
    const cloned = clone(person);
    expectTypeOf(cloned.nameValidator).toBeFunction();
    expectTypeOf(cloned.nameRegex).toBeObject();
    expect(cloned.nameRegex instanceof RegExp).toBe(true);
    expectTypeOf(cloned.details.dateOfBirth).toBeObject();
    expect(cloned.details.dateOfBirth instanceof Date).toBe(true);
  });
  it("clone I debug", () => {
    expect({ person, personCopy: personCloneModified }).toMatchSnapshot();
  });
});
