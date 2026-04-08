import 'server-only'

import { Redis } from 'ioredis'

declare global {
  var redis: Redis | undefined
}

export const redis =
  globalThis.redis ||
  (process.env.CI ? (undefined as unknown as Redis) : new Redis(process.env.REDIS_URL!))

if (process.env.NODE_ENV !== 'production') {
  globalThis.redis = redis
}
