import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import superjson from 'superjson'

import { replaceEqualDeep } from '@/utils/structural-sharing'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        structuralSharing: replaceEqualDeep,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}

let clientQueryClientSingleton: QueryClient

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = makeQueryClient()
  }
  return clientQueryClientSingleton
}
