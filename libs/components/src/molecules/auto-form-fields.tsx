import type { Logger } from '@monorepo/utils'
import type { z } from 'zod'
import { AutoFormField } from './auto-form-field'

type AutoFormFieldsProps = {
  schema: z.ZodObject
  formData: Record<string, unknown>
  stepTitle?: string
  logger?: Logger
}

export function AutoFormFields({ schema, formData, stepTitle, logger }: AutoFormFieldsProps) {
  return (
    <>
      {stepTitle && (
        <h3 className="text-lg font-medium mb-4" data-testid="step-title">
          {stepTitle}
        </h3>
      )}
      <div className="space-y-4">
        {Object.keys(schema.shape).map(fieldName => (
          <AutoFormField fieldName={fieldName} fieldSchema={schema.shape[fieldName] as z.ZodTypeAny} formData={formData} key={fieldName} logger={logger} />
        ))}
      </div>
    </>
  )
}
