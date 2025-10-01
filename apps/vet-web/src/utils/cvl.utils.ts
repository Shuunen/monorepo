/** biome-ignore-all lint/style/useNamingConvention: it'ok here */
import { z } from 'zod/v4'
import type { CodeVersionLabel } from './cvl.types.ts'

export function cvlToSchema(list: CodeVersionLabel[]) {
  return z.union(
    list.map(cvl =>
      z.object({
        Code: z.literal(cvl.Code),
        Version: z.literal(cvl.Version),
      }),
    ),
  )
}
