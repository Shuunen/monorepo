import { randomNumber } from "./random.js";
import { sleep } from "./sleep.js";

/**
 * Fill an input like a human would do
 * @param input the HTMLInputElement to fill
 * @param value the value to fill
 * @returns nothing
 * @example await utils.fillLikeHuman(input, 'hello world')
 */
export async function fillLikeHuman(input: HTMLInputElement, value: string) {
  input.focus();
  for (const char of value) {
    input.value += char;
    // oxlint-disable-next-line no-magic-numbers, no-await-in-loop
    await sleep(randomNumber(40, 80));
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
  input.blur();
}
