import 'server-only'

import { router } from '@/lib/trpc'
import { awesome } from './awesome'
import { oaRobot } from './oa-robot'
import { short } from './short'
import { user } from './user'
import { userContent } from './user-content'

export type AppRouter = typeof appRouter

export const appRouter = router({
  user,
  awesome,
  short,
  oaRobot,
  userContent,
})
