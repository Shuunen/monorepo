import { useEffect, useState } from "react";
import { createActor } from "xstate";
import type { z } from "zod";

export function useMachineSchemas<Input>(machine: Parameters<typeof createActor>[0], input: Input) {
  const [schemas, setSchemas] = useState<z.ZodObject[]>([]);
  useEffect(() => {
    const actor = createActor(machine, { input });
    function handleStateChange(state: { context: { schemas: z.ZodObject[] } }) {
      setSchemas(state.context.schemas);
    }
    const subscription = actor.subscribe(handleStateChange);
    actor.start();
    return () => {
      subscription.unsubscribe();
      actor.stop();
    };
  }, [input, machine]);
  return schemas;
}
