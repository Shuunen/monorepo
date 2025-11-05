/** biome-ignore-all assist/source/useSortedKeys: it's ok in schemas */
import { z } from 'zod'
import { documentFileSchema } from '../components/molecules/form-file-upload.utils'
import { ageInput } from '../utils/age.utils'
import { breedInput } from '../utils/breed.utils'

const identifier = z
  .string()
  .regex(/^FR\d{4}$/u, 'Identifier must be FR and 4 digits')
  .meta({ label: 'Pet identifier', placeholder: 'FR0000' })

export const step1Schema = z
  .object({
    identifier,
    name: z.string().min(1, 'Pet name is required').meta({ label: 'Name', placeholder: 'Enter pet name' }),
    age: ageInput,
    breed: breedInput,
    knowsParent: z.boolean().optional().meta({ label: 'I know the mother' }),
    parentIdentifier: z.string().meta({ dependsOn: 'knowsParent', label: 'Mother identifier', placeholder: 'Enter pet ID or microchip number' }),
  })
  .meta({ step: '1. Pet Information' })

export const step2Schema = z
  .object({
    // Dog field (only visible when breed === 'dog')
    exerciseRoutine: z.string().optional().meta({
      dependsOn: 'breed=dog',
      label: 'Exercise Routine',
      placeholder: 'Describe daily exercise habits',
    }),
    // Cat field (only visible when breed === 'cat')
    weight: z.number().optional().meta({
      dependsOn: 'breed=cat',
      label: 'Weight (kg)',
      placeholder: '25',
    }),
    // Cat and Dog common fields
    file: documentFileSchema.optional().meta({
      label: 'Upload your pet health report',
    }),
  })
  .meta({ step: '2. Additional Details' })
