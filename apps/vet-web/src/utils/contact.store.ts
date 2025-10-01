import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FormState = {
  firstName: string
  lastName: string
  message: string
  setFormData: (data: Partial<FormState>) => void
  resetForm: () => void
}

export const useFormStore = create<FormState>()(
  persist(
    set => ({
      firstName: '',
      lastName: '',
      message: '',
      resetForm: () => {
        set({
          firstName: '',
          lastName: '',
          message: '',
        })
      },
      setFormData: data => {
        // eslint-disable-next-line max-nested-callbacks
        set(state => ({
          ...state,
          ...data,
        }))
      },
    }),
    {
      name: 'contact-storage',
    },
  ),
)
