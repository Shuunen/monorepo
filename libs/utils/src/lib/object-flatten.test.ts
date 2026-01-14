import { flatten } from "./object-flatten.js";

describe("object-flatten", () => {
  const person = {
    age: 21,
    details: { dateOfBirth: new Date("2001-12-22"), favouriteFood: "sushi" },
    name: "John",
    nameRegex: /^jo/iu,
    nameValid: true,
    nameValidator: (input: string) => input.length > 3,
  };
  it("flatten A object", () => {
    expect(flatten(person)).toMatchSnapshot();
  });
  it("flatten B object with a custom root path", () => {
    expect(flatten(person, "person")).toMatchSnapshot();
  });
  it("flatten C object containing an array", () => {
    expect(flatten({ collection: ["pikachu", "drake"], name: "John" })).toMatchSnapshot();
  });
});
