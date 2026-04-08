import { router } from '@/lib/trpc'
import { items } from './items'

export const short = router({
  items,
})
