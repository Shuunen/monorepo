/** biome-ignore-all assist/source/useSortedKeys: it's ok in schemas */
import { field } from "@monorepo/components";
import { nbThird } from "@monorepo/utils";
import { z } from "zod";
import { ageInput } from "../../utils/age.utils";

export const step1Schema = z.object({
  email: field(z.email("Invalid email address"), {
    label: "Email Address",
    placeholder: "We'll never share your email",
  }),
  name: field(z.string().min(nbThird, "Name is required"), {
    label: "Full Name",
    placeholder: "Enter your legal name",
  }),
});

export const step2Schema = z.object({
  age: ageInput,
  subscribe: field(z.boolean().optional(), {
    label: "Subscribe to newsletter",
    placeholder: "Check to subscribe",
  }),
});
