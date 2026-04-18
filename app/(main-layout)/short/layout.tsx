import { prefetchSession } from '@daveyplate/better-auth-tanstack/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { getQueryClient } from '@/lib/query-client'
import { trpcServer } from '@/lib/trpc-server'

export default async function ShortLayout({ children }: LayoutProps<'/short'>) {
  const queryClient = getQueryClient()

  await Promise.all([
    prefetchSession(auth, queryClient, { headers: await headers() }),

    queryClient.prefetchQuery(trpcServer.short.items.list.queryOptions()),
  ])

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
