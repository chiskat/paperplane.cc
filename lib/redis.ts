import 'server-only'

import { Redis } from 'ioredis'

export const redis =
  ((globalThis as any).redis as Redis) ||
  (process.env.CI ? (null as unknown as Redis) : new Redis(process.env.REDIS_URL!))

if (process.env.NODE_ENV !== 'production') {
  ;(globalThis as any).redis = redis
}
