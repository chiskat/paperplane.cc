import { NextRequest } from 'next/server'
import { createOpenApiFetchHandler } from 'trpc-to-openapi'

import { appRouter } from '@/apis/appRouter'
import { createTRPCContext } from '@/lib/trpc'

const handler = (req: NextRequest) =>
  createOpenApiFetchHandler({
    endpoint: '/api',
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    req,
  })

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
}
