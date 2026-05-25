import { router } from '@/lib/trpc'
import { cronTrigger } from './cron-trigger'
import { notification } from './notification'
import { profile } from './profile'
import { record } from './record'
import { subscription } from './subscription'

export const wlb = router({
  profile,
  subscription,
  record,
  notification,
  cronTrigger,
})
