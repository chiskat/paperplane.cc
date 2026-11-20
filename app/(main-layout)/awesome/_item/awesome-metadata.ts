import 'server-only'

import type { Metadata } from 'next'

import { getQueryClient } from '@/lib/query-client'
import { trpcServer } from '@/lib/trpc-server'

export async function getAwesomeMetadata(id: string): Promise<Metadata> {
  const awesome = await getQueryClient().fetchQuery(
    trpcServer.awesome.items.get.queryOptions({ id })
  )

  return { title: `${awesome.label} - Awesome - PaperPlane.cc` }
}
