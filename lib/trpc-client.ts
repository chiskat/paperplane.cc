'use client'

import {
  createTRPCProxyClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import superjson from 'superjson'

import { transformFormDataLink } from '@/utils/form-data-transformer'
import type { AppRouter } from '../apis/appRouter'

export const trpcClientConfig: Parameters<typeof createTRPCProxyClient>[0] = {
  links: [
    transformFormDataLink,

    splitLink({
      condition: op => isNonJsonSerializable(op.input),
      true: httpLink({
        url: `/api/trpc`,
        transformer: { serialize: data => data, deserialize: superjson.deserialize },
      }),
      false: httpBatchLink({ url: `/api/trpc`, transformer: superjson }),
    }),
  ],
}

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()
