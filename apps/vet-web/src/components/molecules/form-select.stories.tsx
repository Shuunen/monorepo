import { DebugData } from '@monorepo/components'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { expect, userEvent, within } from 'storybook/test'
import { ages } from '../../utils/age.utils'
import { breeds } from '../../utils/breed.utils'
import { FormSelect } from './form-select'
import type { PropsOption } from './form-select.utils'

type FormSelectStoryProps = {
  options: PropsOption[]
  id: string
  name: string
  multiple?: boolean
  placeholder?: string
}

type Canvas = {
  getByRole: (role: string) => HTMLElement
  getByTestId: (testId: string) => HTMLElement
}

function FormSelectWrapper({ name, options, id, placeholder, ...rest }: FormSelectStoryProps) {
  const methods = useForm({ defaultValues: { [name]: '' } })
  const [formValues, setFormValues] = useState<Record<string, string | undefined>>(methods.getValues())

  useEffect(() => {
    const subscription = methods.watch(value => {
      setFormValues(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [methods])

  return (
    <div className="space-y-4">
      <FormProvider {...methods}>
        <Controller control={methods.control} name={name} render={({ field }) => <FormSelect {...rest} field={field} form={methods} isRequired={false} name={name} options={options} placeholder={placeholder} testId={id} />} />
      </FormProvider>
      <DebugData data={formValues} />
    </div>
  )
}

async function selectOption(canvas: Canvas, id: string, value: string) {
  const combobox = canvas.getByRole('combobox')
  await userEvent.click(combobox)
  const option = document.querySelector(`[data-testid="${id}-${value}"]`)
  if (!option) throw new Error(`Option with testid ${id}-${value} not found`)
  await userEvent.click(option)
}

async function selectMultipleOptions(canvas: Canvas, id: string, values: string[]) {
  const combobox = canvas.getByRole('combobox')
  await userEvent.click(combobox)
  await Promise.all(values.map(value => selectOption(canvas, id, value)))
}

async function checkLabel(canvas: Canvas, expectedLabel: string) {
  await expect(canvas.getByRole('combobox')).toHaveTextContent(expectedLabel)
}

async function checkSelection(canvas: Canvas, expectedLabel: string, expectedDebugData: string) {
  await expect(canvas.getByRole('combobox')).toHaveTextContent(expectedLabel)
  await expect(canvas.getByTestId('debug-data')).toHaveTextContent(expectedDebugData)
}

const meta = {
  component: FormSelectWrapper,
  parameters: {
    layout: 'centered',
  },
  render: args => <FormSelectWrapper {...args} />,
  tags: ['autodocs'],
  title: 'molecules/FormSelect',
} satisfies Meta<typeof FormSelectWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const StringValue: Story = {
  args: {
    id: 'breed',
    name: 'breed',
    options: breeds,
    placeholder: 'Select the breed',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await checkLabel(canvas, 'Select the breed')
    await selectOption(canvas, 'breed', breeds[0].value)
    await checkSelection(canvas, breeds[0].label, `"breed": "${breeds[0].value}"`)
  },
}

export const MultipleString: Story = {
  args: {
    id: 'breeds',
    multiple: true,
    name: 'breeds',
    options: breeds,
    placeholder: 'Select breeds',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await checkLabel(canvas, 'Select breeds')
    await selectMultipleOptions(canvas, 'breeds', [breeds[0].value, breeds[1].value])
    await checkSelection(canvas, `${breeds[0].label}, ${breeds[1].label}`, `"breeds": [ "${breeds[0].value}", "${breeds[1].value}" ]`)
  },
}

export const ObjectValue: Story = {
  args: {
    id: 'age',
    name: 'age',
    options: ages,
    placeholder: 'Select the age range',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await checkLabel(canvas, 'Select the age range')
    await selectOption(canvas, 'age', ages[0].Code)
    await checkSelection(canvas, ages[0].label, `{ "age": { "Code": "${ages[0].Code}", "Version": "${ages[0].Version}" } }`)
  },
}

export const MultipleObject: Story = {
  args: {
    id: 'ages',
    multiple: true,
    name: 'ages',
    options: ages,
    placeholder: 'Select ages',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await checkLabel(canvas, 'Select ages')
    await selectMultipleOptions(canvas, 'ages', [ages[0].Code, ages[1].Code])
    await checkSelection(canvas, `${ages[0].label}, ${ages[1].label}`, '{ "ages": [ { "Code": "MINUS-5", "Version": "01" }, { "Code": "FROM-5-TO-10", "Version": "03" } ] }')
  },
}
