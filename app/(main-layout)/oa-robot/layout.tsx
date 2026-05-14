import { prefetchSession } from '@daveyplate/better-auth-tanstack/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { getQueryClient } from '@/lib/query-client'
import { trpcServer } from '@/lib/trpc-server'

export default async function OARobotLayout({ children }: LayoutProps<'/oa-robot'>) {
  const queryClient = getQueryClient()

  await Promise.all([
    prefetchSession(auth as any, queryClient, { headers: await headers() }),

    queryClient.prefetchQuery(trpcServer.oaRobot.profile.list.queryOptions()),
  ])

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
