import 'server-only'

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'

import { mainModel } from '@/lib/agent/models'
import { web_extract } from '../skill-web-extract'
import { web_search } from '../skill-web-search'

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  const result = streamText({
    model: mainModel,
    messages: modelMessage,
    system:
      '如果现有知识不足以回答问题，或是需要较新的更具有时效性信息，或是需要核实当前事实等场景，推荐使用 \`web_search\` 工具联网搜索。如果搜索结果的摘要不足以回答问题，可使用 \`web_extract\` 工具提取相关网页的正文内容。',
    tools: { web_extract, web_search },
    stopWhen: stepCountIs(10),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
