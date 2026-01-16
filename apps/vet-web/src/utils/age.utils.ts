/** biome-ignore-all lint/style/useNamingConvention: it'ok here */
/** biome-ignore-all assist/source/useSortedKeys: conflict with oxlint */
import { field } from "@monorepo/components";
import { z } from "zod";
import type { CodeVersionLabel } from "./cvl.types.ts";
import { cvlToSchema } from "./cvl.utils";

export const ages = [
  { Code: "MINUS-5", Version: "01", label: "Moins de 5 ans" },
  { Code: "FROM-5-TO-10", Version: "03", label: "De 5 à 10 ans" },
  { Code: "MORE-10", Version: "07", label: "Plus de 10 ans" },
] as const satisfies CodeVersionLabel[];

export const ageSchema = cvlToSchema(ages);

export const ageInput = field(z.enum(ages.map(age => age.Code)), {
  label: "Age",
  options: ages.map(age => ({ label: age.label, value: age.Code })),
  placeholder: "Select the age range",
});
