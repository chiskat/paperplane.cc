'use client'

import { AppProgressProvider } from '@bprogress/next'
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient } from '@trpc/client'
import { PropsWithChildren, useState } from 'react'

import type { AppRouter } from '@/apis/appRouter'
import { getQueryClient } from '@/lib/query-client'
import { trpcClientConfig, TRPCProvider } from '@/lib/trpc-client'
import { replaceEqualDeep } from '@/utils/structural-sharing'

export default function QueryProvider(props: PropsWithChildren) {
  const [queryClient] = useState(() => getQueryClient())
  const [trpcClient] = useState(() => createTRPCClient<AppRouter>(trpcClientConfig))

  return (
    <AppProgressProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <AuthQueryProvider queryOptions={{ structuralSharing: replaceEqualDeep }}>
            {props.children}
          </AuthQueryProvider>
        </TRPCProvider>
      </QueryClientProvider>
    </AppProgressProvider>
  )
}
