import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, IconArrowLeft, Input, Textarea } from '@monorepo/components'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormFileUpload } from '../../../components/molecules/form-file-upload'
import { documentAccept, documentFileSchema } from '../../../components/molecules/form-file-upload.utils'
import { useFormChangeDetector } from '../../../utils/form.utils'
import { useBookAppointmentStore } from '../-steps.store'
import { type DogComplementaryData, dogComplementaryDataSchema, hasAccess } from '../-steps.utils'

// eslint-disable-next-line max-lines-per-function, max-statements
function DogComplementaryDataForm() {
  const navigate = useNavigate()
  const { data, setDogComplementaryData, setCurrentStep } = useBookAppointmentStore()

  useEffect(() => {
    const step = 1
    const check = hasAccess(step, 'dog', data)
    if (!check.ok) navigate({ to: '/book-appointment/step-1' })
    setCurrentStep(step)
  }, [data, navigate, setCurrentStep])

  const complementaryData = data.complementaryData as DogComplementaryData

  const form = useForm<DogComplementaryData>({
    defaultValues: complementaryData,
    resolver: zodResolver(dogComplementaryDataSchema),
  })

  const onSubmit = () => {
    navigate({ to: '/book-appointment/step-3' })
  }

  useFormChangeDetector(form, setDogComplementaryData)

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input placeholder="Enter dog color" {...field} data-testid="color" />
              </FormControl>
              <FormMessage testId="color-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input placeholder="Enter dog weight" type="number" {...field} data-testid="weight" />
              </FormControl>
              <FormMessage testId="weight-message" />
            </FormItem>
          )}
        />

        <FormFileUpload accept={documentAccept} form={form} isRequired={false} label="Upload your dog health report" name="file" schema={documentFileSchema} testId="file" />

        <FormField
          control={form.control}
          name="exerciseRoutine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Routine</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your dog's exercise routine" {...field} data-testid="exerciseRoutine" />
              </FormControl>
              <FormMessage testId="exerciseRoutine-message" />
            </FormItem>
          )}
        />

        <div className="flex justify-between space-x-4 pt-4">
          <Link to="/book-appointment/step-1">
            <Button data-testid="back" testId="back" type="button" variant="link">
              <IconArrowLeft /> Back
            </Button>
          </Link>

          <Button data-testid="next" testId="submit" type="submit">
            Go to summary
          </Button>
        </div>
      </form>
    </Form>
  )
}

export const Route = createFileRoute('/book-appointment/dog/step-2')({
  component: DogComplementaryDataForm,
})
