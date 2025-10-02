# Forms

This document provides an overview of the form features in this web application.

## Libraries

- [React Hook Form](https://react-hook-form.com/) - A performant, flexible, and extensible forms library for React.
- [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.

## Features

- **Form Validation**: Forms are validated using Zod schemas to ensure data integrity.
- **Multi-Step Forms**: Forms are divided into multiple steps for better user experience.
- **Error Handling**: Real-time error messages are displayed to guide users in correcting their input.
- **Optional sections**: Some form sections are optional, allowing users to skip them if desired.
- **Variants**: Different form variants are available at the first step to handle various user needs.
- **Field states**: Fields can be in different states such as editable (default), disabled (greyed out version of editable), read-only (human-readable version of the field).
- **Declarative Design**: Forms are designed to be dynamically generated based on the zod schema.
- **Type-Safe Metadata**: Field metadata is type-safe using branded types for better developer experience.

## Field Metadata

Field metadata is defined using a custom Zod extension with branded types for compile-time type safety:

```tsx
import { z } from 'zod';

// Define field metadata type
type FieldMetadata = {
  label: string;
  placeholder?: string;
  state?: 'editable' | 'disabled' | 'readonly';
};

// Extend Zod with metadata support
declare module 'zod' {
  interface ZodTypeDef {
    metadata?: FieldMetadata;
  }
  
  interface ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    meta(metadata: FieldMetadata): this;
  }
}

// Implementation
z.ZodType.prototype.meta = function(metadata: FieldMetadata) {
  this._def.metadata = metadata;
  return this;
};
```

This extension allows you to attach type-safe metadata directly to your Zod schemas without relying on JSON serialization.

## Example

Here is an example of a simple form with validation:

```tsx
import { z } from 'zod';
import { useMemo } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name'
  }),
  email: z.string().email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: 'We\'ll never share your email'
  })
});

function MyForm() {
  const schemas = useMemo(() => [schema], []);
  const onSubmit = (data: z.infer<typeof schema>) => { 
    logger.info('onSubmit', data);
  };
  
  return <AutoForm schemas={schemas} onSubmit={onSubmit} />;
}
```

This form collects a user's name and email, validating the input according to the defined schema.

## Multi-Step Forms

Here is an example of a multi-step form:

```tsx
import { z } from 'zod';
import { useMemo } from 'react';

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name'
  }),
  email: z.string().email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: 'We\'ll never share your email'
  })
});

const step2Schema = z.object({
  address: z.string().min(5, 'Address is required').meta({
    label: 'Address',
    placeholder: 'Enter your street address'
  }),
  gender: z.enum(['male', 'female', 'other']).optional().meta({
    label: 'Gender',
    placeholder: 'Select your gender'
  })
});

function MultiStepForm() {
  const schemas = useMemo(() => [step1Schema, step2Schema], []);
  const onSubmit = (data: z.infer<typeof step1Schema> & z.infer<typeof step2Schema>) => { 
    logger.info('onSubmit', data);
  };
  
  return <AutoForm schemas={schemas} onSubmit={onSubmit} />;
}
```

This multi-step form collects user information in two steps, with validation at each step.

## Dynamic Multi-Step Forms with Variants

Here is an example of a multi-step form with variants that dynamically adjusts based on user selection:

```tsx
import { z } from 'zod';
import { useState, useMemo } from 'react';

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required').meta({
    label: 'Full Name',
    placeholder: 'Enter your legal name'
  }),
  email: z.string().email('Invalid email address').meta({
    label: 'Email Address',
    placeholder: 'We\'ll never share your email'
  }),
  variant: z.enum(['basic', 'advanced']).meta({
    label: 'Form Type',
    placeholder: 'Select the type of form you want to complete'
  }),
});

const step2Schema = z.object({
  address: z.string().min(5, 'Address is required').meta({
    label: 'Address',
    placeholder: 'Enter your street address'
  }),
  gender: z.enum(['male', 'female', 'other']).optional().meta({
    label: 'Gender',
    placeholder: 'Select your gender'
  }),
});

const step3Schema = z.discriminatedUnion('hasHolidays', [
  z.object({
    city: z.string().optional().meta({
      label: 'City',
      placeholder: 'Enter your city of residence'
    }),
    hasHolidays: z.literal(false).meta({
      label: 'Holidays',
      placeholder: 'Do you have any holidays planned?'
    }),
  }),
  z.object({
    city: z.string().optional().meta({
      label: 'City',
      placeholder: 'Enter your city of residence'
    }),
    hasHolidays: z.literal(true).meta({
      label: 'Holidays',
      placeholder: 'Do you have any holidays planned?'
    }),
    holidayDestination: z.enum(['beach', 'mountains', 'city', 'countryside']).meta({
      label: 'Holiday Destination',
      placeholder: 'Select your holiday destination'
    }),
    holidayDuration: z.number().min(1, 'Duration must be at least 1 day').meta({
      label: 'Holiday Duration (days)',
      placeholder: 'Enter the duration of your holiday in days'
    }),
  }),
]);

type FormData = Partial<
  z.infer<typeof step1Schema> & 
  z.infer<typeof step2Schema> & 
  z.infer<typeof step3Schema>
>;

function CompleteForm() {
  const [formData, setFormData] = useState<FormData>({ variant: 'basic' });
  
  // Memoize schemas based on variant to avoid unnecessary re-renders
  const schemas = useMemo(() => {
    if (formData.variant === 'advanced') {
      return [step1Schema, step2Schema, step3Schema];
    }
    return [step1Schema, step2Schema];
  }, [formData.variant]);
  
  const onChange = (data: FormData) => { 
    logger.info('onChange', data);
    setFormData(data);
  };
  
  const onSubmit = (data: FormData) => { 
    logger.info('onSubmit', data);
    // Handle form submission
  };
  
  return (
    <AutoForm 
      schemas={schemas} 
      initialData={formData}
      onSubmit={onSubmit} 
      onChange={onChange} 
    />
  );
}
```

This form allows users to select a variant at the first step, which dynamically adjusts the subsequent steps of the form. The schemas are memoized to prevent unnecessary re-computation, and form data is properly typed throughout.

## Field States

Fields can be rendered in different states by setting the `state` property in the metadata:

```tsx
const readOnlySchema = z.object({
  userId: z.string().meta({
    label: 'User ID',
    state: 'readonly'
  }),
  name: z.string().meta({
    label: 'Name',
    state: 'editable'
  }),
  email: z.string().email().meta({
    label: 'Email',
    state: 'disabled'
  })
});
```

- **editable** (default): Normal input field that users can interact with
- **disabled**: Greyed out field that cannot be modified
- **readonly**: Human-readable display of the field value (not an input)

## Best Practices

1. **Define schemas outside components**: Schemas should be defined at module level or memoized to avoid recreation on every render.

2. **Use TypeScript inference**: Leverage `z.infer<typeof schema>` for type-safe form data throughout your application.

3. **Memoize dynamic schemas**: When schemas change based on form state, use `useMemo` to prevent unnecessary recalculations.

4. **Handle variant switching carefully**: When switching between variants that add/remove steps, consider what happens to data from removed steps.

5. **Preserve form state**: Consider implementing draft saving or session storage for long forms to prevent data loss.

6. **Validate progressively**: Use real-time validation (onChange/onBlur) for better user experience, but also validate on submit as a final check.

## Type Safety

All form data is fully type-safe when using TypeScript with Zod schemas. The `onSubmit` and `onChange` handlers automatically infer the correct types from your schemas:

```tsx
// TypeScript knows the exact shape of data
const onSubmit = (data: z.infer<typeof schema>) => {
  // data.name is string
  // data.email is string
  // TypeScript will error if you try to access non-existent properties
};
```

This ensures compile-time safety and excellent IDE autocomplete support throughout your forms.
