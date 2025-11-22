import { z } from 'zod'

export const searchSchema = z.object({
  q: z.string().trim().max(200).optional().or(z.literal(''))
})

export type SearchFormValues = z.infer<typeof searchSchema>

export type SearchParams = {
  q?: string
  location?: string
  brand?: string
}

