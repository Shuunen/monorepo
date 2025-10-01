import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger, Textarea } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import { Check, ChevronsUpDown, Command } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { logger } from '../../utils/logger.utils'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const FormSchema = z.object({
  language: z.string(),
  // eslint-disable-next-line no-magic-numbers
  message: z.string().min(3, {
    message: 'Message must be at least 3 characters long.',
  }),
})

// eslint-disable-next-line max-lines-per-function
export function ComboboxForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  /* c8 ignore start */
  // eslint-disable-next-line consistent-function-scoping
  // oxlint-disable-next-line explicit-module-boundary-types
  // oxlint-disable-next-line consistent-function-scoping
  function onSubmit(data: z.infer<typeof FormSchema>) {
    logger.info('onSubmit', data)
  }

  const onChange = () => {
    logger.info('onChange', form.getValues())
  }
  /* c8 ignore end */

  return (
    <Form {...form}>
      <form className="space-y-6" onChange={onChange} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea data-testid={field.name} placeholder="Type your message here." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')} data-testid="language-combobox" role="combobox" testId="combo-box" variant="outline">
                      {field.value ? languages.find(language => language.value === field.value)?.label : 'Select language'}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput className="h-9" placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map(language => (
                          <CommandItem
                            data-testid={`language-option-${language.value}`}
                            key={language.value}
                            onSelect={() => {
                              /* c8 ignore next 2 */
                              form.setValue('language', language.value)
                            }}
                            value={language.label}
                          >
                            {language.label}
                            <Check className={cn('ml-auto', language.value === field.value ? 'opacity-100' : 'opacity-0')} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>This is the language that will be used in the dashboard.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button data-testid="submit" testId="submit" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
