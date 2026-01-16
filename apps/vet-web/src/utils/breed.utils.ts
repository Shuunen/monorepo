import { field } from "@monorepo/components";
import { z } from "zod";
import type { Option } from "./form.types.ts";
import { optionToSchema } from "./form.utils";

export const breeds = [
  { label: "Cat / Feline", value: "cat" },
  { label: "Dog / Canine", value: "dog" },
] as const satisfies Option[];

export const breedSchema = optionToSchema(breeds);

export const breedInput = field(z.enum(breeds.map(breed => breed.value)), {
  label: "Breed",
  options: breeds.map(breed => ({ label: breed.label, value: breed.value })),
  placeholder: "Select a breed",
});
