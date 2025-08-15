import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { type buttonVariants, Button as ShadButton } from '../shadcn/button'

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    testId?: string
  }

export function Button({ children, variant, size, className = '', asChild = false, disabled, testId, ...props }: ButtonProps) {
  const classes = `${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
  return (
    <ShadButton asChild={asChild} className={classes} data-testid={testId} disabled={disabled} size={size} variant={variant} {...props}>
      {children}
    </ShadButton>
  )
}
