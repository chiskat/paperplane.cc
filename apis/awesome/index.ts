import { router } from '@/lib/trpc'
import { catelogs } from './catelogs'
import { items } from './items'
import { tags } from './tags'

export const awesome = router({
  items,
  catelogs,
  tags,
})
