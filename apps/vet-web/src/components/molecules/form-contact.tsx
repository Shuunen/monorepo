import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea } from '@monorepo/components'
import { nbMsInSecond } from '@monorepo/utils'
import { debounce } from 'es-toolkit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useFormStore } from '../../utils/contact.store'
import { logger } from '../../utils/logger.utils'
import { FormUser } from './form-user'

const minChars = 3

const contactFormSchema = z.object({
  message: z.string().min(minChars),
  other: z
    .object({
      primary: z.string(),
      secondary: z.string(),
    })
    .optional(),
  user: z.object({
    firstName: z.string().min(minChars),
    lastName: z.string().min(minChars),
  }),
})

export type ContactForm = z.infer<typeof contactFormSchema>

// eslint-disable-next-line max-lines-per-function
export function FormContact() {
  const { firstName, lastName, message, setFormData, resetForm } = useFormStore()

  const form = useForm<ContactForm>({
    defaultValues: {
      message,
      user: {
        firstName,
        lastName,
      },
    },
    resolver: zodResolver(contactFormSchema),
  })

  function saveFormDataSync() {
    const values = form.getValues()
    setFormData({
      firstName: values.user.firstName,
      lastName: values.user.lastName,
      message: values.message,
    })
    logger.info('Form data saved')
  }

  const saveFormData = debounce(saveFormDataSync, nbMsInSecond)

  function clearFormData() {
    resetForm()
    form.reset()
    logger.info('Form data cleared')
  }

  function onSubmit(values: ContactForm) {
    logger.info('Form submitted', values)
    logger.success('Form submitted')
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onChange={saveFormData} onSubmit={form.handleSubmit(onSubmit)}>
        <FormUser<ContactForm> name="user" />
        {/* Lines below will successfully cause a TypeScript error :
        <FormUser<ContactForm> name="other" />
        <FormUser<ContactForm> name="message" /> */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea data-testid={field.name} placeholder="Type your message here." {...field} />
              </FormControl>
              <FormMessage testId="form-message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button disabled={!form.formState.isValid} testId="submit" type="submit">
            Submit
          </Button>
          <Button onClick={clearFormData} testId="reset" type="button">
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
