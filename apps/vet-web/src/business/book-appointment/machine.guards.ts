/**
 * Determines if the given breed corresponds to a cat.
 * @param formData An object containing the form data
 * @returns True if the breed is "cat", false otherwise.
 */
export function isCat(formData: { breed?: string }) {
  return formData.breed === "cat";
}
