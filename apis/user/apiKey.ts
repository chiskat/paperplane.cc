import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'

export const apiKey = router({
  ensure: loginProcedure.query(async ({ ctx }) => {
    const headers = await ctx.getHeaders()
    const apiKeys = await auth.api.listApiKeys({ headers })

    if (apiKeys.length <= 0) {
      const newApiKey = await auth.api.createApiKey({ body: { name: 'DEFAULT_API_KEY' }, headers })
      const result = { key: newApiKey.key }

      return result
    }

    const apiKey = await prisma.apikey.findFirstOrThrow({ where: { id: apiKeys[0].id } })
    const result = { key: apiKey.key }

    return result
  }),
})
