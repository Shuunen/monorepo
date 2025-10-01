import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-border': 'hsl(var(--border))',
          '--normal-text': 'hsl(var(--popover-foreground))',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
