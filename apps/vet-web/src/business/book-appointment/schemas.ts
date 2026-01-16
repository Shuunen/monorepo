/** biome-ignore-all assist/source/useSortedKeys: it's ok in schemas */
import { field, step } from "@monorepo/components";
import { z } from "zod";
import { ageInput } from "../../utils/age.utils";
import { breedInput } from "../../utils/breed.utils";

const identifier = field(z.string().regex(/^FR\d{4}$/u, "Identifier must be FR and 4 digits"), { label: "Pet identifier", placeholder: "FR0000" });

export const step1AnimalDetails = step(
  z.object({
    identifier,
    name: field(z.string().min(1, "Pet name is required"), { label: "Name", placeholder: "Enter pet name" }),
    age: ageInput,
    breed: breedInput,
    knowsParent: field(z.boolean().optional(), { label: "I know the mother" }),
    parentIdentifier: field(z.string(), { dependsOn: "knowsParent", label: "Mother identifier", placeholder: "Enter pet ID or microchip number" }),
  }),
  { title: "1. Animal Details" },
);

export const step2DogDetails = step(
  z.object({
    exerciseRoutine: field(z.string().min(1, "Exercise routine is required"), {
      label: "Exercise Routine",
      placeholder: "Describe daily exercise habits",
    }),
    onDiet: field(z.boolean().optional(), { label: "Is your dog on a diet?" }),
  }),
  { title: "2. Dog Details" },
);

export const step2CatDetails = step(
  z.object({
    weight: field(z.number().min(1, "Weight must be greater than 1 kg"), {
      label: "Weight (kg)",
      placeholder: "Enter weight",
    }),
    onDiet: field(z.boolean().optional(), { label: "Is your cat on a diet?" }),
  }),
  { title: "2. Cat Details" },
);

export const step2bTheDiet = step(
  z.object({
    dietFrequency: field(z.enum(["daily", "weekly"]), {
      label: "Diet Frequency",
    }),
    isVegan: field(z.boolean().optional(), { label: "Is the diet vegan?" }),
  }),
  { title: "2b. Diet Details" },
);

export const step3Allergies = step(
  z.object({
    isAllergicToPeanuts: field(z.boolean().optional(), { label: "Allergic to peanuts?" }),
    isAllergicToSeafood: field(z.boolean().optional(), { label: "Allergic to seafood?" }),
    allergiesDocument: field(z.file().optional(), {
      label: "Upload allergies document",
      description: "Upload any relevant medical documents regarding allergies.",
      placeholder: "Select a file",
    }),
  }),
  { title: "3. Allergies & Parent Info" },
);
