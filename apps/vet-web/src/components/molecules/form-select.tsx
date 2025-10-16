import { Button, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, FormControl, Popover, PopoverContent, PopoverTrigger } from '@monorepo/components'
import { cn } from '@monorepo/utils'
// oxlint-disable-next-line no-restricted-imports
import { Check, ChevronsUpDown, Command } from 'lucide-react'
import { useState } from 'react'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'
import type { FieldBaseProps } from '../../utils/form.types'
import { handleSelect, isOptionSelected, type PropsOption } from './form-select.utils'

const EMPTY_SELECTION = 0
const MIN_OPTIONS_FOR_SEARCH = 10

type Props<TypeFieldValues extends FieldValues = FieldValues> = {
  field: ControllerRenderProps<TypeFieldValues>
  options: PropsOption[]
  multiple?: boolean
} & FieldBaseProps

export function FormSelect<TypeFieldValues extends FieldValues>({ form, field, name, options, placeholder, multiple }: Props<TypeFieldValues>) {
  const [open, setOpen] = useState(false)
  const selectedOptions = options.filter(option => isOptionSelected(option, field.value))
  const displayValue = selectedOptions.length > EMPTY_SELECTION ? selectedOptions.map(opt => opt.label).join(', ') : (placeholder ?? 'Select')

  function onSelect(option: PropsOption) {
    const shouldClose = handleSelect({ fieldValue: field.value, form, multiple, name, option })
    if (shouldClose) setOpen(false)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button className={cn('min-w-48 max-w-96 justify-between', !field.value && 'text-muted-foreground')} role="combobox" testId="combo-box" variant="outline">
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {options.length >= MIN_OPTIONS_FOR_SEARCH && <CommandInput className="h-9" placeholder={`Search ${name}...`} />}
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  data-testid={`${name}-${'value' in option ? option.value : option.Code}`}
                  key={'value' in option ? option.value : option.Code}
                  onSelect={() => {
                    onSelect(option)
                  }}
                  value={option.label}
                >
                  {option.label}
                  <Check className={cn('ml-auto', isOptionSelected(option, field.value) ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
