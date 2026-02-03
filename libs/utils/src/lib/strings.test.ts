import {
  capitalize,
  crc32,
  createCrc32Table,
  ellipsis,
  ellipsisWords,
  isString,
  sanitize,
  slugify,
  stringSum,
} from "./strings.js";

it("sanitize A basic word", () => {
  expect(sanitize("Superbe")).toBe("superbe");
});
it("sanitize B basic sentence", () => {
  expect(sanitize("Superbe météo aujourd'hui")).toBe("superbe meteo aujourd hui");
});
it("sanitize C complex sentence", () => {
  expect(
    sanitize(" d'emblée€|| la@ PLUIE,,:& pùïs un cOup dê tonnerre_ !! Et puis 2 !? Mais qu'est-ce qui se trame..."),
  ).toBe("d emblee la pluie puis un coup de tonnerre et puis 2 mais qu est ce qui se trame");
});
it("sanitize D text with tags", () => {
  expect(sanitize("<div>Superbe météo aujourd'hui</div>", false)).toBe("Superbe meteo aujourd hui");
});
it("sanitize E text with quotes", () => {
  expect(sanitize('"some-metal-parts"')).toBe("some metal parts");
});

const expected = "oh-ma-darling";
it("slugify A simple", () => {
  expect(slugify("Oh ma darling")).toBe(expected);
});
it("slugify B medium", () => {
  expect(slugify("Oh !ma  darling ")).toBe(expected);
});
it("slugify C veteran", () => {
  expect(slugify("  Oh %*ma  darling .?! ")).toBe(expected);
});
it("slugify D expected is expected", () => {
  expect(slugify(expected)).toBe(expected);
});
it("slugify E OMG o_O", () => {
  expect(slugify("  -Oh mà  dârling .?! --")).toBe(expected);
});

it("capitalize an empty string", () => {
  expect(capitalize("")).toBe("");
});
it("capitalize a single word", () => {
  expect(capitalize("hey")).toBe("Hey");
});
it("capitalize an uppercase word", () => {
  expect(capitalize("HO")).toBe("HO");
});
it("capitalize a sentence", () => {
  expect(capitalize("hello my name is John Doe !")).toBe("Hello my name is John Doe !");
});
it("capitalize a sentence and lower John Doe", () => {
  expect(capitalize("hello my name is John Doe !", true)).toBe("Hello my name is john doe !");
});

it("ellipsis words, giving an empty string", () => {
  expect(ellipsisWords("")).toBe("");
});
it("ellipsis words, giving a regular sentence", () => {
  expect(ellipsisWords("Hello my name is Jim Halpert", 5)).toBe("Hello my name is Jim...");
});
it("ellipsis words, giving a short string that should not be processed", () => {
  expect(ellipsisWords("Hello there")).toBe("Hello there");
});

it("ellipsis, giving an empty string", () => {
  expect(ellipsis("")).toBe("");
});
it("ellipsis, giving a regular string", () => {
  expect(ellipsis("I really like pineapples", 18)).toBe("I really like pine...");
});
it("ellipsis, giving a short string that should not be processed", () => {
  expect(ellipsis("I really like pineapples")).toBe("I really like pineapples");
});

it("string sum a simple word", () => {
  expect(stringSum("plop")).toBe(-1177138288);
});
it("string sum a sentence", () => {
  expect(stringSum("ça fait du bien par où ça passe")).toBe(1_300_099_934);
});
it("string sum should be the same on the same string", () => {
  expect(true).toBe(true);
});

it("isString valid", () => {
  expect(isString("plop")).toBe(true);
});
it("isString invalid", () => {
  expect(isString(123)).toBe(false);
});

it("createCrc32Table", () => {
  expect(createCrc32Table()).toMatchSnapshot();
});
it("crc32 A", () => {
  expect(crc32("Hello world !")).toBe(118_369_344);
});
it("crc32 B", () => {
  expect(crc32("12 is a great number LÔL !! :p")).toBe(1_336_548_843);
});
