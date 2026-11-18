import 'server-only'

import { createMcpHandler } from 'mcp-handler'
import z from 'zod'

const inputSchema = z.object({
  a: z.number().describe('第一个数字'),
  b: z.number().describe('第二个数字'),
})

const outputSchema = z.object({
  result: z.number().describe('计算结果'),
  operator: z.enum(['+', '-', '*', '/']).describe('本次使用的运算符'),
  expression: z.string().describe('可读的表达式'),
})

const createResult = ({
  a,
  b,
  operator,
  result,
}: {
  a: number
  b: number
  operator: '+' | '-' | '*' | '/'
  result: number
}) => ({
  content: [{ type: 'text' as const, text: `${a} ${operator} ${b} = ${result}` }],
  structuredContent: { result, operator, expression: `${a} ${operator} ${b} = ${result}` },
})

const handler = createMcpHandler(
  server => {
    server.registerTool(
      'add',
      { description: '计算两个数字的加法。', inputSchema, outputSchema },
      async ({ a, b }) => createResult({ a, b, operator: '+', result: a + b })
    )

    server.registerTool(
      'subtract',
      { description: '计算两个数字的减法。', inputSchema, outputSchema },
      async ({ a, b }) => createResult({ a, b, operator: '-', result: a - b })
    )

    server.registerTool(
      'multiply',
      { description: '计算两个数字的乘法。', inputSchema, outputSchema },
      async ({ a, b }) => createResult({ a, b, operator: '*', result: a * b })
    )

    server.registerTool(
      'divide',
      { description: '计算两个数字的除法。', inputSchema, outputSchema },
      async ({ a, b }) => {
        if (b === 0) {
          return { isError: true, content: [{ type: 'text' as const, text: '除数不能为 0。' }] }
        }

        return createResult({ a, b, operator: '/', result: a / b })
      }
    )
  },
  {
    serverInfo: { name: 'mcp-calc-http-next', version: '1.0.0' },
    instructions:
      '这是一个计算器 MCP 服务，提供 add、subtract、multiply、divide 四个工具，用于计算两个数字的四则运算。遇到明确的数学计算请求时，优先调用对应工具而不是自行心算。调用 divide 时必须确保除数不为 0；如果用户要求除以 0，应直接告知该操作无效。',
  }
)

export { handler as GET, handler as POST, handler as DELETE }
