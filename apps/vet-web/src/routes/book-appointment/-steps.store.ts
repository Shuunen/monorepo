import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppointmentBaseData, AppointmentData, CatComplementaryData, DogComplementaryData } from './-steps.utils.ts'

// eslint-disable-next-line no-magic-numbers
type CurrentStep = 0 | 1 | 2

export type BookAppointmentState = {
  currentStep: CurrentStep
  setCurrentStep: (step: CurrentStep) => void
  // Base data
  data: AppointmentData
  setBaseData: (baseData: AppointmentBaseData) => void
  // Complementary data
  setCatComplementaryData: (data: CatComplementaryData) => void
  setDogComplementaryData: (data: DogComplementaryData) => void
  // Utilities
  resetForm: () => void
}

const initialData = {
  baseData: {
    breed: 'cat',
    knowsParent: true,
  } satisfies Partial<AppointmentBaseData>,
  complementaryData: {
    indoorOutdoor: 'indoor',
  } satisfies Partial<AppointmentData['complementaryData']>,
} as AppointmentData

export const useBookAppointmentStore = create<BookAppointmentState>()(
  persist(
    // eslint-disable-next-line max-lines-per-function
    (set, get) => ({
      currentStep: 0,
      data: initialData,
      resetForm: () => {
        set({ currentStep: 0, data: initialData })
      },
      setBaseData: baseData => {
        set({
          data: {
            baseData,
            complementaryData: initialData.complementaryData,
          },
        })
      },
      setCatComplementaryData: catData => {
        // eslint-disable-next-line max-nested-callbacks
        set(state => ({
          data: {
            ...state.data,
            complementaryData: catData,
          },
        }))
      },
      setCurrentStep: step => {
        if (get().currentStep === step) return
        set({ currentStep: step })
      },
      setDogComplementaryData: dogData => {
        // eslint-disable-next-line max-nested-callbacks
        set(state => ({
          data: {
            ...state.data,
            complementaryData: dogData,
          },
        }))
      },
    }),
    {
      name: 'book-appointment-storage',
    },
  ),
)
