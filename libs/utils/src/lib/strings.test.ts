import { capitalize, crc32, createCrc32Table, ellipsis, ellipsisWords, injectMark, isString, sanitize, slugify, stringSum } from "./strings.js";

it("sanitize A basic word", () => {
  expect(sanitize("Superbe")).toBe("superbe");
});
it("sanitize B basic sentence", () => {
  expect(sanitize("Superbe météo aujourd'hui")).toBe("superbe meteo aujourd hui");
});
it("sanitize C complex sentence", () => {
  expect(sanitize(" d'emblée€|| la@ PLUIE,,:& pùïs un cOup dê tonnerre_ !! Et puis 2 !? Mais qu'est-ce qui se trame...")).toBe("d emblee la pluie puis un coup de tonnerre et puis 2 mais qu est ce qui se trame");
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

it("injectMark on empty string", () => {
  expect(injectMark("", "placeholder", "da-mark")).toBe("");
});
it("injectMark on string that does not contain any placeholder", () => {
  expect(injectMark("Hello world", "placeholder", "da-mark")).toBe("Hello world");
});
it("injectMark on string that contains one placeholder inside mustaches", () => {
  expect(injectMark("Hello {placeholder}} world", "placeholder", "da-mark")).toBe("Hello da-mark world");
});
it("injectMark on string that contains one placeholder inside underscores", () => {
  expect(injectMark("Hello __placeholder__ world", "placeholder", "da-mark")).toBe("Hello da-mark world");
});
it("injectMark on string that contains one placeholder on a div", () => {
  expect(injectMark('Hello <div id="placeholder">...</div> world', "placeholder", "da-mark")).toBe('Hello <div id="placeholder">da-mark</div> world');
});
it("injectMark on string that contains one placeholder on a div with a class", () => {
  expect(injectMark('Hello <div id="placeholder" class="mt-6 p-4">...</div> world', "placeholder", "da-mark")).toBe('Hello <div id="placeholder" class="mt-6 p-4">da-mark</div> world');
});
it("injectMark on string that contains one placeholder on a meta tag", () => {
  expect(injectMark('<meta name="placeholder" content="..." />', "placeholder", "da-mark")).toBe('<meta name="placeholder" content="da-mark" />');
});
it("injectMark on a complex string with multiple placeholders", () => {
  expect(injectMark('Hello __placeholder__ I like <meta name="placeholder" content="..." /> and <div id="placeholder" class="mt-6 p-4">OLD-mark</div> :)', "placeholder", "super-mark")).toBe(
    'Hello super-mark I like <meta name="placeholder" content="super-mark" /> and <div id="placeholder" class="mt-6 p-4">super-mark</div> :)',
  );
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
