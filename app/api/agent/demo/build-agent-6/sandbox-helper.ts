import Sandbox from '@e2b/code-interpreter'
import { ModelMessage } from 'ai'

import { redis } from '@/lib/redis'

let sandboxPromise: Promise<Sandbox> | undefined

const sandboxRedisKey = 'agent-demo:build-agent-2:default-sandbox-id'
const sandboxRedisTtlSeconds = Math.ceil(10 * 60)

export function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`
}

export function truncateText(text: string, maxLength = 1000) {
  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength)}\n\n...已截断 ${text.length - maxLength} 个字符`
}

export function resolveSandboxPath(cwd: string, relativePath: string) {
  if (relativePath.startsWith('/')) return relativePath.replace(/\/+/g, '/')
  if (cwd === '.') return relativePath

  return `${cwd}/${relativePath}`.replace(/\/+/g, '/')
}

export async function ensureSandbox() {
  if (sandboxPromise) {
    return sandboxPromise
  }

  sandboxPromise = (async () => {
    const cachedSandboxId = await redis.get(sandboxRedisKey)

    if (cachedSandboxId) {
      try {
        const sandbox = await Sandbox.connect(cachedSandboxId, {
          apiKey: process.env.AI_E2B_API_KEY,
        })
        await redis.expire(sandboxRedisKey, sandboxRedisTtlSeconds)

        return sandbox
      } catch {
        await redis.del(sandboxRedisKey)
      }
    }

    const sandbox = await Sandbox.create(process.env.AI_E2B_TEMPLATE_ID || 'code-interpreter-v1', {
      apiKey: process.env.AI_E2B_API_KEY,
    })

    await redis.set(sandboxRedisKey, sandbox.sandboxId, 'EX', sandboxRedisTtlSeconds)

    return sandbox
  })().finally(() => {
    sandboxPromise = undefined
  })

  return sandboxPromise
}

export function isSandboxInited(messages: ModelMessage[]) {
  return messages.some(message => {
    if (message.role !== 'tool') {
      return false
    }

    return message.content.some(
      part => part.type === 'tool-result' && part.toolName === 'init_sandbox'
    )
  })
}
