import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@monorepo/components'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormSelect } from '../../components/molecules/form-select'
import { OptionalSection } from '../../components/molecules/optional-section'
import { ages } from '../../utils/age.utils'
import { breeds } from '../../utils/breed.utils'
import { useFormChangeDetector } from '../../utils/form.utils'
import { useBookAppointmentStore } from './-steps.store'
import { type AppointmentBaseData, baseDataSchema } from './-steps.utils'

// eslint-disable-next-line max-lines-per-function
function BaseDataForm() {
  const navigate = useNavigate()
  const { data, setBaseData, setCurrentStep } = useBookAppointmentStore()

  useEffect(() => {
    setCurrentStep(0)
  }, [setCurrentStep])

  const form = useForm<AppointmentBaseData>({
    defaultValues: data.baseData,
    resolver: zodResolver(baseDataSchema),
  })

  const onSubmit = async (values: AppointmentBaseData) => {
    await navigate({ to: `/book-appointment/${values.breed}/step-2` })
  }

  useFormChangeDetector(form, setBaseData)

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet identifier</FormLabel>
              <FormControl>
                <Input placeholder="Enter pet ID or microchip number" {...field} data-testid="identifier" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter pet name" {...field} data-testid="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <FormSelect field={field} form={form} isRequired={false} name="age" options={ages} placeholder="Select the age range" testId="age" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormSelect field={field} form={form} isRequired={false} name="breed" options={breeds} placeholder="Select a breed" testId="breed" />
              <FormMessage />
            </FormItem>
          )}
        />

        <OptionalSection checkboxLabel="I know the mother" checkboxName="knowsParent" checkboxTestId="knows-parent" conditionalFieldName="parentIdentifier" form={form}>
          {field => (
            <FormItem>
              <FormLabel>Mother identifier</FormLabel>
              <FormControl>
                <Input placeholder="Enter pet ID or microchip number" {...field} data-testid="parent-identifier" value={(field.value as string) || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </OptionalSection>

        <div className="flex justify-center mt-6">
          <Button data-testid="next" testId="goto" type="submit">
            Go to complementary data <ArrowRightIcon />
          </Button>
        </div>
      </form>
    </Form>
  )
}

export const Route = createFileRoute('/book-appointment/step-1')({
  component: BaseDataForm,
})
