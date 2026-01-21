/** biome-ignore-all assist/source/useSortedKeys: it'ok in this context */
import { assign, setup } from "xstate";
import { step1AnimalDetails, step2bTheDiet, step2CatDetails, step2DogDetails, step3Allergies } from "./schemas";
import { isCat, isFrench } from "./machine.guards";
import type { Context, Input } from "./machine.types";

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
  },
  guards: {
    isCat: ({ context }) => isCat(context),
    isFrench: ({ context }) => isFrench(context),
    isDog: ({ context }) => context.formData?.breed === "dog",
    isOnDiet: ({ context }) => context.formData?.onDiet === true,
    isNotOnDiet: ({ context }) => context.formData?.onDiet === false,
    isDietFilled: ({ context }) => context.formData?.dietFrequency !== undefined,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCED2qDWACAhgBz1QEsA7AFwFsxysAzVAJwoDoBlMsPLARiwSwCCJIhRwAbLBDBkcRMbADEAbQAMAXUShCsImSKoSmkAA9EAJgCsAFmYA2ABxmAzNxW2LtgJwXvZgDQgAJ6IThZOzFYqFvYA7E4qTpFhVrYAvqkBaJi4BMTkVDT0TGwcXLz8QiLiktKy8srcGkgg2rr6hs2mCJY2Ds6u7l4+Fv5BiNz2KhH2FjEqZtxWFosWKjHpmejY+ISklNRkdIws7JxYZnxYACKoUDUycoqqTVqoOnoGRl223OH2VvZPJ4nE4zJ4EvMAsFupFmPMzLY3JYHGsYmkMiAsttcnsCociidSudLjc7lIHvUlI0jK0Ph1QN9fsx-oDgaDwfFRtCnLYYnYzGYrEtHOCPPZ0Ztsjs8vtCscSmcLvwAMI4Q7kupPdQ0t5tT6dRA-P4AoEgsEQrnjTw2OYC+wzTwxYG2JwbTFbHK7fIHI7FU5cJVYVXq2qPBovFq6ulfQ1Mlmm9kWqGIezcZigsFmGLcbjOFTebhurGemV432ExUAI0uABUABZgSREaTKbXNWntGMIVwqKYxQGuGLLKzAzz2ZPdQXMR0I8VWOYOUHpDEkVBSeDNYvS3E+gk696dg0IAC0tgnx4s06B15v15iZiLHu33rlfqJ5UEwlEEg1j33evpExECsS0EBccIvEdX4eX7a9HylHEX3xeV-WJfhSXuTV-2jI8rG4Tw7BUPDPDMf5uFsKwXAnUE+U8cjwPnf5YPWDEt0Q2VkLfRVLmDTC-3bKNDwZYCzCmMIwUdaxXBFCduGsK8fhUcjyNE7MrHg7EvQ48sFQDat+HrRsIGbMhsKEoCEFTAjnE8H5XFIgEs1koFpniB08JiJYEQ0ksd1fCsuCcS4BDEMQwAYKBmw3V4D31YTu0WWic1WVYnDoo1nPsZgbMRUjrV+Fj0iAA */
  context: ({ input }) => ({
    userProfile: input?.userProfile ?? {},
    formData: input?.formData ?? {},
    schemas: [],
  }),
  id: "Book appointment form",
  initial: "Step 1 : Animal details",
  states: {
    "Step 1 : Animal details": {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step1AnimalDetails),
      }),
      always: [
        {
          target: "Step 2 : Dog details",
          guard: {
            type: "isDog",
          },
        },
        {
          target: "Step 2 : Cat details",
          guard: {
            type: "isCat",
          },
        },
      ],
    },
    "Step 2 : Dog details": {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2DogDetails),
      }),
      always: [
        {
          target: "Step 2b : The diet",
          guard: {
            type: "isOnDiet",
          },
        },
        {
          target: "Step 3 : Allergies",
          guard: {
            type: "isNotOnDiet",
          },
        },
      ],
    },
    "Step 2 : Cat details": {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2CatDetails),
      }),
      always: [
        {
          target: "Step 2b : The diet",
          guard: {
            type: "isOnDiet",
          },
        },
        {
          target: "Step 3 : Allergies",
          guard: {
            type: "isNotOnDiet",
          },
        },
      ],
    },
    "Step 2b : The diet": {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step2bTheDiet),
      }),
      always: [
        {
          target: "Step 3 : Allergies",
          guard: {
            type: "isDietFilled",
          },
        },
      ],
    },
    "Step 3 : Allergies": {
      entry: assign({
        schemas: ({ context }) => context.schemas.concat(step3Allergies),
      }),
      type: "final",
    },
  },
});
