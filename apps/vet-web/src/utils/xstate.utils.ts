import { useEffect, useState } from 'react'
import { createActor } from 'xstate'
import type { z } from 'zod'

export function useMachineSchemas<InitialData>(machine: Parameters<typeof createActor>[0], initialData: InitialData) {
  const [schemas, setSchemas] = useState<z.ZodObject[]>([])
  useEffect(() => {
    const initialState = { input: { formData: initialData } }
    const actor = createActor(machine, initialState)
    function handleStateChange(state: { context: { schemas: z.ZodObject[] } }) {
      setSchemas(state.context.schemas)
    }
    const subscription = actor.subscribe(handleStateChange)
    actor.start()
    return () => {
      subscription.unsubscribe()
      actor.stop()
    }
  }, [initialData, machine])
  return schemas
}
