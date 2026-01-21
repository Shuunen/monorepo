import type { Input } from "./machine.types";

/**
 * Determines if the given breed corresponds to a cat.
 * @param input The input context
 * @returns True if the breed is "cat", false otherwise.
 */
export function isCat(input: Input) {
  return input.formData?.breed === "cat";
}

/**
 * Determines if the user is from France based on their profile.
 * @param input The input context
 * @returns True if the user's country is "FR", false otherwise.
 */
export function isFrench(input: Input) {
  return input.userProfile?.country === "FR";
}
