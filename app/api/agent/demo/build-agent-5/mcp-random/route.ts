import 'server-only'

import { createMcpHandler } from 'mcp-handler'
import z from 'zod'

const handler = createMcpHandler(
  server => {
    server.registerTool(
      'random',
      {
        description: '生成一个 [0, 1) 范围内的随机数。',
        inputSchema: z.object({}),
        outputSchema: z.object({ result: z.number().describe('生成的随机数') }),
      },
      async () => {
        const result = Math.random()

        return {
          content: [{ type: 'text' as const, text: String(result) }],
          structuredContent: { result },
        }
      }
    )
  },
  {
    serverInfo: { name: 'mcp-random', version: '1.0.0' },
    instructions: '这是一个随机数 MCP 服务，提供 random 工具，用于生成 [0, 1) 范围内的随机数。',
  }
)

export { handler as GET, handler as POST, handler as DELETE }
