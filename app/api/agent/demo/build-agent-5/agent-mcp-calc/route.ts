import { createMCPClient } from '@ai-sdk/mcp'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from 'ai'

import { mainModel } from '@/lib/agent/models'
import { redis } from '@/lib/redis'

export async function POST(request: Request) {
  const initializeCacheKey = `agent-mcp:mcp-client:demo-mcp-calc-sdk-v1`
  const cachedInitializeResult = await redis.getex(initializeCacheKey, 'EX', 60 * 60)
  const initialInitializeResult = cachedInitializeResult
    ? JSON.parse(cachedInitializeResult)
    : undefined

  const client = await createMCPClient({
    clientName: 'mcp-calc-http-v1',
    transport: {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/demo/build-agent-5/mcp-calc-sdk-v1`,
      type: 'http',
    },
    initialInitializeResult,
  })
  if (!initialInitializeResult) {
    await redis.set(initializeCacheKey, JSON.stringify(client.initializeResult), 'EX', 60 * 60)
  }

  const toolsCacheKey = `agent-mcp:mcp-tools:demo-mcp-calc-sdk-v1`
  const cachedToolDefinitions = await redis.get(toolsCacheKey)
  const toolDefinitions = cachedToolDefinitions
    ? JSON.parse(cachedToolDefinitions)
    : await client.listTools()
  const tools = client.toolsFromDefinitions(toolDefinitions)
  if (!cachedToolDefinitions) {
    await redis.set(toolsCacheKey, JSON.stringify(toolDefinitions), 'EX', 60 * 60)
  }

  const { messages } = await request.json()
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: mainModel,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    onFinish: async () => {
      await client.close()
    },
  })
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })
}
