import 'server-only'

import { router } from '@/lib/trpc'
import { awesome } from './awesome'
import { oaRobot } from './oa-robot'
import { short } from './short'
import { user } from './user'

export type AppRouter = typeof appRouter

export const appRouter = router({
  user,
  awesome,
  short,
  oaRobot,
})
