import type { z } from "zod";

export type FormData = {
  age?: string;
  breed?: "dog" | "cat";
  dietFrequency?: "daily" | "weekly";
  exerciseRoutine?: string;
  identifier?: string;
  isAllergicToPeanuts?: boolean;
  isAllergicToSeafood?: boolean;
  allergiesDocument?: File;
  isVegan?: boolean;
  knowsParent?: boolean;
  name?: string;
  onDiet?: boolean;
  parentIdentifier?: string;
  weight?: number;
};

export type Input = {
  userProfile?: { country?: string };
  formData?: FormData;
};

export type Context = Input & {
  schemas: z.ZodObject[];
};
