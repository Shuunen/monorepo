import { Button } from '@monorepo/components'
import { useCallback } from 'react'
import { navigate } from '../utils/navigation.utils'

export function AppButtonNext({ label = 'Home', type = 'button', url = '/' }: Readonly<{ label?: string; type?: 'button' | 'submit'; url?: string }>) {
  const onClick = useCallback(() => {
    navigate(url)
  }, [url])
  return (
    <Button onClick={onClick} testId="next" type={type}>
      {label}
    </Button>
  )
}
