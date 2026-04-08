import 'server-only'

import { apiKey } from '@better-auth/api-key'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { genericOAuth } from 'better-auth/plugins'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  basePath: '/api/auth',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secondaryStorage: process.env.CI
    ? undefined
    : {
        get: async key => {
          return await redis.get(key)
        },
        set: async (key, value, ttl) => {
          if (ttl) {
            await redis.set(key, value, 'EX', ttl)
          } else {
            await redis.set(key, value)
          }
        },
        delete: async key => {
          await redis.del(key)
        },
      },
  plugins: [
    apiKey({
      storage: 'secondary-storage',
      fallbackToDatabase: true,
      enableSessionForAPIKeys: true,
      apiKeyHeaders: ['X-API-KEY'],
      rateLimit: { enabled: false },
      defaultKeyLength: 16,
      disableKeyHashing: true,
    }),
    genericOAuth({
      config: [
        {
          providerId: 'gitea',
          clientId: process.env.OA2_CLIENT_ID!,
          clientSecret: process.env.OA2_CLIENT_SECRET,
          discoveryUrl: process.env.OA2_DISCOVERY_URL,
          scopes: ['user:email'],
          mapProfileToUser: async profile => ({ ...profile, name: profile.name || profile.email }),
        },
      ],
    }),
    nextCookies(),
  ],
  advanced: {
    cookiePrefix: 'cc.paperplane',
  },
})
