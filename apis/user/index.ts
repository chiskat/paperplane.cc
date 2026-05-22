import { router } from '@/lib/trpc'
import { apiKey } from './api-key'

export const user = router({
  apiKey,
})
