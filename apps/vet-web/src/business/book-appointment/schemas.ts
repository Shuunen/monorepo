/** biome-ignore-all assist/source/useSortedKeys: it's ok in schemas */
import { z } from 'zod'
import { ageInput } from '../../utils/age.utils'
import { breedInput } from '../../utils/breed.utils'

const identifier = z
  .string()
  .regex(/^FR\d{4}$/u, 'Identifier must be FR and 4 digits')
  .meta({ label: 'Pet identifier', placeholder: 'FR0000' })

export const step1AnimalDetails = z
  .object({
    identifier,
    name: z.string().min(1, 'Pet name is required').meta({ label: 'Name', placeholder: 'Enter pet name' }),
    age: ageInput,
    breed: breedInput,
    knowsParent: z.boolean().optional().meta({ label: 'I know the mother' }),
    parentIdentifier: z.string().meta({ dependsOn: 'knowsParent', label: 'Mother identifier', placeholder: 'Enter pet ID or microchip number' }),
  })
  .meta({ step: '1. Animal Details' })

export const step2DogDetails = z
  .object({
    exerciseRoutine: z.string().min(1, 'Exercise routine is required').meta({
      label: 'Exercise Routine',
      placeholder: 'Describe daily exercise habits',
    }),
    onDiet: z.boolean().optional().meta({ label: 'Is your dog on a diet?' }),
  })
  .meta({ step: '2. Dog Details' })

export const step2CatDetails = z
  .object({
    weight: z.number().min(1, 'Weight must be greater than 1 kg').meta({
      label: 'Weight (kg)',
      placeholder: 'Enter weight',
    }),
    onDiet: z.boolean().optional().meta({ label: 'Is your cat on a diet?' }),
  })
  .meta({ step: '2. Cat Details' })

export const step2bTheDiet = z
  .object({
    dietFrequency: z.enum(['daily', 'weekly']).meta({
      label: 'Diet Frequency',
    }),
    isVegan: z.boolean().optional().meta({ label: 'Is the diet vegan?' }),
  })
  .meta({ step: '2b. Diet Details' })

export const step3Allergies = z
  .object({
    isAllergicToPeanuts: z.boolean().optional().meta({ label: 'Allergic to peanuts?' }),
    isAllergicToSeafood: z.boolean().optional().meta({ label: 'Allergic to seafood?' }),
    allergiesDocument: z.file().optional().meta({
      label: 'Upload allergies document',
      description: 'Upload any relevant medical documents regarding allergies.',
      placeholder: 'Select a file',
    }),
  })
  .meta({ step: '3. Allergies & Parent Info' })
