import { Button, IconArrowLeft } from '@monorepo/components'
import { useCallback } from 'react'

const previous = -1

export function AppButtonBack({ stepsBack = 1 }: Readonly<{ stepsBack?: number }>) {
  const goBack = useCallback(() => {
    globalThis.history.go(previous * stepsBack)
  }, [stepsBack])

  return (
    <Button onClick={goBack} testId="back" variant="outline">
      <IconArrowLeft />
      Back
    </Button>
  )
}
