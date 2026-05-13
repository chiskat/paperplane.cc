import { router } from '@/lib/trpc'
import { messages } from './message'
import { profile } from './profile'

export const oaRobot = router({
  profile,
  messages,
})
