import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@monorepo/components'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormFileUpload } from '../../../components/molecules/form-file-upload.js'
import { documentAccept, documentFileSchema } from '../../../components/molecules/form-file-upload.utils'
import { useBookAppointmentStore } from '../../../routes/book-appointment/-steps.store'
import { useFormChangeDetector } from '../../../utils/form.utils'
// oxlint-disable-next-line max-dependencies
import { type CatComplementaryData, catComplementaryDataSchema, hasAccess, vaccinationStatuses } from '../-steps.utils'

// eslint-disable-next-line max-lines-per-function, max-statements
function CatComplementaryDataForm() {
  const navigate = useNavigate()
  const { data, setCatComplementaryData, setCurrentStep } = useBookAppointmentStore()

  useEffect(() => {
    const step = 1
    const check = hasAccess(step, 'cat', data)
    if (!check.ok) navigate({ to: '/book-appointment/step-1' })
    setCurrentStep(step)
  }, [data, navigate, setCurrentStep])

  const complementaryData = data.complementaryData as CatComplementaryData

  const form = useForm<CatComplementaryData>({
    defaultValues: complementaryData,
    resolver: zodResolver(catComplementaryDataSchema),
  })

  const onSubmit = () => {
    navigate({ to: '/book-appointment/step-3' })
  }

  useFormChangeDetector(form, setCatComplementaryData)

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="indoorOutdoor"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Environment</FormLabel>
              <FormControl>
                <RadioGroup className="flex flex-col space-y-1" data-testid="indoorOutdoor" defaultValue={field.value} onValueChange={field.onChange}>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem data-testid="indoorOutdoor-indoor" value="indoor" />
                    </FormControl>
                    <FormLabel className="font-normal">Indoor Only</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem data-testid="indoorOutdoor-outdoor" value="outdoor" />
                    </FormControl>
                    <FormLabel className="font-normal">Outdoor Only</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem data-testid="indoorOutdoor-both" value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">Both Indoor and Outdoor</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastFleaTreatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Flea Treatment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="lastFleaTreatment" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormFileUpload accept={documentAccept} form={form} isRequired={false} label="Upload your cat health report" name="file" schema={documentFileSchema} testId="file" />

        <FormField
          control={form.control}
          name="vaccinationStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vaccination Status</FormLabel>
              <Select data-testid="vaccinationStatus" defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vaccination status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vaccinationStatuses.map(status => (
                    <SelectItem data-testid={`vaccinationStatus-${status}`} key={status} value={status}>
                      {status.replace(/-/gu, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-24 mt-4">
          <Link to="/book-appointment/step-1">
            <Button data-testid="back" testId="back" type="button" variant="link">
              <ArrowLeftIcon /> Back
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

export const Route = createFileRoute('/book-appointment/cat/step-2')({
  component: CatComplementaryDataForm,
})
