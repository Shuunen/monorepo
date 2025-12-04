/** biome-ignore-all assist/source/useSortedKeys: it'ok in this context */
import { assign, setup } from 'xstate'
import type { z } from 'zod'
import { step1AnimalDetails, step2bTheDiet, step2CatDetails, step2DogDetails, step3Allergies } from './schemas'

export type FormData = {
  age?: string
  breed?: 'dog' | 'cat'
  dietFrequency?: 'daily' | 'weekly'
  exerciseRoutine?: string
  identifier?: string
  isAllergicToPeanuts?: boolean
  isAllergicToSeafood?: boolean
  allergiesDocument?: File
  isVegan?: boolean
  knowsParent?: boolean
  name?: string
  onDiet?: boolean
  parentIdentifier?: string
  weight?: number
}

type Context = {
  formData: FormData
  schemas: z.ZodObject[]
}

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as { formData?: FormData },
  },
  guards: {
    isCat: ({ context }) => context.formData.breed === 'cat',
    isDog: ({ context }) => context.formData.breed === 'dog',
    isOnDiet: ({ context }) => context.formData.onDiet === true,
    isNotOnDiet: ({ context }) => context.formData.onDiet === false,
    isDietFilled: ({ context }) => context.formData.dietFrequency !== undefined,
  },
}).createMachine({
  context: ({ input }) => ({
    formData: input?.formData ?? {},
    schemas: [],
  }),
  id: 'Book appointment form',
  initial: 'Step 1 : Animal details',
  states: {
    'Step 1 : Animal details': {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step1AnimalDetails),
      }),
      always: [
        {
          target: 'Step 2 : Dog details',
          guard: {
            type: 'isDog',
          },
        },
        {
          target: 'Step 2 : Cat details',
          guard: {
            type: 'isCat',
          },
        },
      ],
    },
    'Step 2 : Dog details': {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2DogDetails),
      }),
      always: [
        {
          target: 'Step 2b : The diet',
          guard: {
            type: 'isOnDiet',
          },
        },
        {
          target: 'Step 3 : Allergies',
          guard: {
            type: 'isNotOnDiet',
          },
        },
      ],
    },
    'Step 2 : Cat details': {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2CatDetails),
      }),
      always: [
        {
          target: 'Step 2b : The diet',
          guard: {
            type: 'isOnDiet',
          },
        },
        {
          target: 'Step 3 : Allergies',
          guard: {
            type: 'isNotOnDiet',
          },
        },
      ],
    },
    'Step 2b : The diet': {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2bTheDiet),
      }),
      always: [
        {
          target: 'Step 3 : Allergies',
          guard: {
            type: 'isDietFilled',
          },
        },
      ],
    },
    'Step 3 : Allergies': {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step3Allergies),
      }),
      type: 'final',
    },
  },
})
