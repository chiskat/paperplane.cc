import 'server-only'

import { createMCPClient, type MCPClient } from '@ai-sdk/mcp'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type ToolSet,
  type UIMessage,
} from 'ai'

import { mainModel } from '@/lib/agent/models'

interface McpServerConfig {
  name: string
  url: string
  transportType: 'http' | 'sse'
}

interface AgentMcpRequestBody {
  messages: UIMessage[]
  mcpServers: McpServerConfig[]
}

export async function POST(request: Request) {
  const { messages, mcpServers } = (await request.json()) as AgentMcpRequestBody
  const modelMessages = await convertToModelMessages(messages)

  const clients: MCPClient[] = []
  const instructions: string[] = []
  const tools: ToolSet = {}

  try {
    for (let index = 0; index < mcpServers.length; index += 1) {
      const mcpServer = mcpServers[index]
      const mcpServerName = `mcp__${mcpServer.name}`

      const client = await createMCPClient({
        clientName: `mcp-client__${mcpServer.name}`,
        transport: {
          type: mcpServer.transportType,
          url: new URL(mcpServer.url, request.url).toString(),
        },
      })

      clients.push(client)

      Object.entries(await client.tools()).forEach(([toolName, tool]) => {
        Object.assign(tools, {
          [`${mcpServerName}__${toolName}`]: {
            ...tool,
            description: `此工具来自 MCP 服务器 "${mcpServerName}"。${tool.description || ''}`,
          },
        })
      })

      if (client.instructions?.trim()) {
        instructions.push(`${mcpServerName}: ${client.instructions.trim()}`)
      }
    }
  } catch (error) {
    await Promise.allSettled(clients.map(async client => client.close()))

    throw error
  }

  let system = undefined
  if (mcpServers.length > 0) {
    system = `你可以按需调用已连接的 MCP 工具，工具名格式为 “mcp__服务器名__工具名”。\n已连接的 MCP 服务器：${mcpServers.map(server => `"${server.name}"`).join('、')}。\n\n以下是各个 MCP 服务器介绍：\n\n`
    system += instructions.join('\n\n')
  }

  const result = streamText({
    model: mainModel,
    system,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    onFinish: async () => {
      await Promise.allSettled(clients.map(async client => client.close()))
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
