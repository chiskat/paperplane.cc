import 'server-only'

import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'

import { mainModel } from '@/lib/agent/models'

const clarifyingRequirement = tool({
  description:
    '当用户的需求不够明确，无法可靠继续处理时，向用户确认需求。优先提供 2 到 6 个简短、互斥、容易选择的选项；如仍需要更多细节，可允许用户补充文本。',
  inputSchema: z.object({
    question: z.string().describe('需要向用户确认的问题。问题应简短具体，一次只确认一个关键点。'),
    options: z
      .array(
        z.object({
          label: z.string().describe('选项名称 Key，尽量简短。'),
          description: z.string().optional().describe('选中此项代表的含义或影响。'),
        })
      )
      .min(2)
      .max(4)
      .describe('给用户选择的候选项，优先覆盖最可能的需求方向。'),
    allowCustomText: z
      .boolean()
      .optional()
      .default(true)
      .describe('是否允许用户手动输入补充说明；默认允许。'),
    customTextPlaceholder: z
      .string()
      .optional()
      .default('也可以补充你的具体想法...')
      .describe('补充文本输入框的占位文案。'),
  }),
})

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  const result = streamText({
    model: mainModel,
    messages: modelMessage,
    tools: { clarifyingRequirement },
    stopWhen: stepCountIs(10),
  })

  return result.toUIMessageStreamResponse()
}
