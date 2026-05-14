import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'

const DEFAULT_API_KEY_NAME = 'DEFAULT_API_KEY'

export const apiKey = router({
  ensure: loginProcedure.query(async ({ ctx }) => {
    const headers = await ctx.getHeaders()
    const { apiKeys } = await auth.api.listApiKeys({ headers })
    const defaultApiKey = apiKeys.find(apiKey => apiKey.name === DEFAULT_API_KEY_NAME)

    if (!defaultApiKey) {
      const newApiKey = await auth.api.createApiKey({
        body: { name: DEFAULT_API_KEY_NAME },
        headers,
      })
      const result = { key: newApiKey.key }

      return result
    }

    const apiKey = await prisma.apikey.findFirstOrThrow({
      where: { id: defaultApiKey.id, name: DEFAULT_API_KEY_NAME },
    })
    const result = { key: apiKey.key }

    return result
  }),
})
