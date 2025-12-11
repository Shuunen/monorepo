import { addColorCode, bgBlack, bgBlue, bgCyan, bgGray, bgGreen, bgMagenta, bgRed, bgWhite, bgYellow, black, blue, bold, cyan, dim, gray, green, inverse, isFirefox, italic, magenta, overline, red, reset, strikeThrough, underline, white, yellow } from "./colors.js";

it("is not Firefox", () => {
  expect(isFirefox()).toBe(false);
});

it("add color code", () => {
  expect(addColorCode(22, 32, "test")).toMatchSnapshot();
});

it("color reset", () => {
  expect(reset("test")).toMatchSnapshot();
});
it("color bold", () => {
  expect(bold("test")).toMatchSnapshot();
});
it("color dim", () => {
  expect(dim("test")).toMatchSnapshot();
});
it("color italic", () => {
  expect(italic("test")).toMatchSnapshot();
});
it("color underline", () => {
  expect(underline("test")).toMatchSnapshot();
});
it("color overline", () => {
  expect(overline("test")).toMatchSnapshot();
});
it("color inverse", () => {
  expect(inverse("test")).toMatchSnapshot();
});
it("color strikeThrough", () => {
  expect(strikeThrough("test")).toMatchSnapshot();
});
it("color black", () => {
  expect(black("test")).toMatchSnapshot();
});
it("color red", () => {
  expect(red("test")).toMatchSnapshot();
});
it("color green", () => {
  expect(green("test")).toMatchSnapshot();
});
it("color yellow", () => {
  expect(yellow("test")).toMatchSnapshot();
});
it("color blue", () => {
  expect(blue("test")).toMatchSnapshot();
});
it("color magenta", () => {
  expect(magenta("test")).toMatchSnapshot();
});
it("color cyan", () => {
  expect(cyan("test")).toMatchSnapshot();
});
it("color white", () => {
  expect(white("test")).toMatchSnapshot();
});
it("color gray", () => {
  expect(gray("test")).toMatchSnapshot();
});
it("color bgBlack", () => {
  expect(bgBlack("test")).toMatchSnapshot();
});
it("color bgRed", () => {
  expect(bgRed("test")).toMatchSnapshot();
});
it("color bgGreen", () => {
  expect(bgGreen("test")).toMatchSnapshot();
});
it("color bgYellow", () => {
  expect(bgYellow("test")).toMatchSnapshot();
});
it("color bgBlue", () => {
  expect(bgBlue("test")).toMatchSnapshot();
});
it("color bgMagenta", () => {
  expect(bgMagenta("test")).toMatchSnapshot();
});
it("color bgCyan", () => {
  expect(bgCyan("test")).toMatchSnapshot();
});
it("color bgWhite", () => {
  expect(bgWhite("test")).toMatchSnapshot();
});
it("color bgGray", () => {
  expect(bgGray("test")).toMatchSnapshot();
});
