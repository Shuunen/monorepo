import { type ZodError, z } from "zod";

/**
 * Format a zod error to be short and readable in a snapshot
 * @param error the zod error to format
 * @returns the formatted error
 */
export function zodSnap(error?: ZodError) {
  return error?.issues.map(issue => `${issue.path.join(".")} | ${issue.code} | ${issue.message}`);
}

type NumberSchemaOptions = {
  min?: number;
  max?: number;
};

const integerRegex = /^-?\d+$/;

export function numberSchema(options?: NumberSchemaOptions) {
  let schema = z
    .string({ message: "This field is required" })
    .trim()
    .min(1, { message: "This field is required" })
    .refine(value => integerRegex.test(value), {
      message: "Should be a number",
    })
    .transform(value => Number.parseInt(value, 10));

  const min = options?.min;
  if (min) {
    schema = schema.refine(value => value >= min, { message: `Minimum value is ${min}` });
  }

  const max = options?.max;
  if (max) {
    schema = schema.refine(value => value <= max, { message: `Minimum value is ${max}` });
  }

  return schema;
}

export function optionalNumberSchema(options?: NumberSchemaOptions) {
  const { min, max } = options ?? {};
  let schema = z
    .string()
    .trim()
    // "" → undefined, or keep string value
    .transform(value => (value === "" ? undefined : value))
    // check if it match the pattern
    .refine(value => value === undefined || integerRegex.test(value), { message: "Should be a number" })
    // convert to number
    .transform(value => (value === undefined ? undefined : Number.parseInt(value, 10)));
  if (min !== undefined) {
    schema = schema.refine(value => value === undefined || value >= min, { message: `Minimum value is ${min}` });
  }

  if (max !== undefined) {
    schema = schema.refine(value => value === undefined || value <= max, { message: `Maximum value is ${max}` });
  }

  return schema.optional();
}
