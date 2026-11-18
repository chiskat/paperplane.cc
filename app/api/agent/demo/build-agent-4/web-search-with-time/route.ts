import 'server-only'

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import dayjs from 'dayjs'
import { z } from 'zod'

import { mainModel } from '@/lib/agent/models'
import { web_extract } from '../skill-web-extract'
import { web_search } from '../skill-web-search'

dayjs.locale('zh-cn')

const get_current_time = tool({
  description: '获取当前时间。',
  inputSchema: z.object({}),
  execute: async () => {
    return { formatted: dayjs().format('YYYY-MM-DD dddd HH:mm:ss') }
  },
})

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  const result = streamText({
    model: mainModel,
    messages: modelMessage,
    system:
      '如果现有知识不足以回答问题，或是需要较新的更具有时效性信息，或是需要核实当前事实等场景，推荐使用 \`web_search\` 工具联网搜索。如果搜索结果的摘要不足以回答问题，可使用 \`web_extract\` 工具提取相关网页的正文内容。当搜索具有时效性的消息时，可先使用 \`get_current_time\` 工具获取当前时间，再基于该时间组织搜索词，避免输入错误的日期。',
    tools: { get_current_time, web_extract, web_search },
    stopWhen: stepCountIs(10),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
