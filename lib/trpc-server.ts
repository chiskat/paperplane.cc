import 'server-only'

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { getQueryClient } from '@/lib/query-client'
import { createCallerFactory, createTRPCContext } from './trpc'
import { appRouter } from '../apis/appRouter'

export const trpcServer = createTRPCOptionsProxy({
  ctx: await createTRPCContext(null),
  router: appRouter,
  queryClient: getQueryClient,
})

export const createTRPCCaller = createCallerFactory(appRouter)
