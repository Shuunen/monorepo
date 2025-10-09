import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { type buttonVariants, Button as ShadButton } from '../shadcn/button'

type ButtonProps = ComponentProps<typeof ShadButton> &
  VariantProps<typeof buttonVariants> & {
    testId: string
  }

export function Button({ children, className = '', disabled, testId, ...props }: ButtonProps) {
  const classes = `${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
  return (
    <ShadButton className={classes} data-testid={testId} {...props}>
      {children}
    </ShadButton>
  )
}
