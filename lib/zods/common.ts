import z, { ZodAny } from 'zod'

import { transformerFormDataInput } from '@/utils/form-data-transformer'

export const idZod = z.object({ id: z.string() })

export const resortZod = z.array(z.object({ id: z.string(), index: z.number() }))

export const deleteZod = idZod

export const paginationZod = z.object({
  page: z.int().nonnegative().optional().default(1),
  pageSize: z.int().nonnegative().min(10).max(10).optional().default(10),
})

export function compatFormData<T>(inputZod: T): T {
  return z.transform(transformerFormDataInput).pipe(inputZod as ZodAny) as T
}
