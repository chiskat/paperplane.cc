import 'server-only'

import superjson from 'superjson'

import { redis } from './redis'

const DEFAULT_CACHE_PREFIX = 'with-redis-cache:'

export interface WithRedisCacheOptions<T> {
  /** 缓存键 */
  cacheKey: string

  /** 缓存时间（秒），默认 3600 秒（1 小时）*/
  ttl?: number

  /** 是否跳过缓存，直接执行函数 */
  skipCache?: boolean

  /** 是否在后台刷新缓存（返回旧缓存，异步更新），默认 false */
  staleWhileRevalidate?: boolean

  /** 自定义序列化函数，默认使用 superjson */
  serialize?: (data: T) => string

  /** 自定义反序列化函数，默认使用 superjson */
  deserialize?: (data: string) => T
}

export async function withRedisCache<T>(
  fn: () => T | Promise<T>,
  options: WithRedisCacheOptions<Awaited<T>>
): Promise<Awaited<T>> {
  const {
    cacheKey,
    ttl = 3600,
    skipCache = false,
    staleWhileRevalidate = false,
    serialize = superjson.stringify,
    deserialize = superjson.parse,
  } = options

  const fullCacheKey = `${DEFAULT_CACHE_PREFIX}${cacheKey}`

  if (process.env.CI || skipCache) {
    return await fn()
  }

  try {
    const cached = await redis.get(fullCacheKey)

    if (cached) {
      const cachedData = deserialize(cached)

      if (staleWhileRevalidate) {
        runAndCache(fn, fullCacheKey, ttl, serialize).catch(console.error)
      }

      return cachedData
    }

    return await runAndCache(fn, fullCacheKey, ttl, serialize)
  } catch (error) {
    console.error('Redis cache error:', error)
    return await fn()
  }
}

async function runAndCache<T>(
  fn: () => T | Promise<T>,
  cacheKey: string,
  ttl: number,
  serialize: (data: Awaited<T>) => string
): Promise<Awaited<T>> {
  const data = await fn()

  try {
    await redis.setex(cacheKey, ttl, serialize(data))
  } catch (error) {
    console.error('Failed to cache data:', error)
  }

  return data
}

export async function deleteCache(cacheKey: string): Promise<void> {
  if (process.env.CI) {
    return
  }

  const fullCacheKey = `${DEFAULT_CACHE_PREFIX}${cacheKey}`
  await redis.del(fullCacheKey)
}
