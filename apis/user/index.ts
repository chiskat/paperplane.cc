import { router } from '@/lib/trpc'
import { apiKey } from './apiKey'

export const user = router({
  apiKey,
})
