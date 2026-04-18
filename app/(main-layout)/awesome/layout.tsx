import { prefetchSession } from '@daveyplate/better-auth-tanstack/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { getQueryClient } from '@/lib/query-client'
import { trpcServer } from '@/lib/trpc-server'

export default async function AwesomeLayout({ children }: LayoutProps<'/awesome'>) {
  const queryClient = getQueryClient()

  await Promise.all([
    prefetchSession(auth, queryClient, { headers: await headers() }),

    queryClient.prefetchQuery(trpcServer.awesome.items.tree.queryOptions()),
    queryClient.prefetchQuery(trpcServer.awesome.catelogs.tree.queryOptions()),
    queryClient.prefetchQuery(trpcServer.awesome.catelogs.list.queryOptions()),
    queryClient.prefetchQuery(trpcServer.awesome.tags.list.queryOptions()),
  ])

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
