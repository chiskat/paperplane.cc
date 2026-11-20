import { prefetchSession } from '@daveyplate/better-auth-tanstack/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'

import { getAwesomeMetadata } from '@/app/(main-layout)/awesome/_item/awesome-metadata'
import { auth } from '@/lib/auth'
import { getQueryClient } from '@/lib/query-client'
import { trpcServer } from '@/lib/trpc-server'

export async function generateMetadata({ params }: LayoutProps<'/awesome/[id]'>) {
  const { id } = await params
  return getAwesomeMetadata(id)
}

export default async function AwesomeDetailLayout({
  children,
  params,
}: LayoutProps<'/awesome/[id]'>) {
  const { id } = await params

  const queryClient = getQueryClient()

  await Promise.all([
    prefetchSession(auth as any, queryClient, { headers: await headers() }),

    queryClient.prefetchQuery(trpcServer.awesome.items.get.queryOptions({ id })),
  ])

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
