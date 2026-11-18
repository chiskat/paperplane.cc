import 'server-only'

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import dayjs from 'dayjs'
import { tagTemplate } from 'omn'

import { mainModel } from '@/lib/agent/models'
import { web_extract } from '../skill-web-extract'
import { web_search } from '../skill-web-search'

dayjs.locale('zh-cn')

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  const system = tagTemplate`
    如果现有知识不足以回答问题，或是需要较新的更具有时效性信息，或是需要核实当前事实等场景，推荐使用 \`web_search\` 工具联网搜索。
    如果搜索结果的摘要不足以回答问题，可使用 \`web_extract\` 工具提取相关网页的正文内容。

    当前日期： ${dayjs().format('YYYY年 M月 D日')}。

    当答案中的语句基于 \`web_search\` 结果时，请在该语句之后立即附加引文标记：[cite:ID]，其中 ID 是支持结果项的确切 \`id\` 字段：
    - 例如：“苹果 WWDC 大会将于 6 月份召开。 [cite:3f2a1b9c]”；
    - 某句话如果有多条引文，请把标记串写： “[cite:3f2a1b9c][cite:7d4e0a51]”；
    - 完全复制工具返回的 ID，切勿发明、重新编号或重复使用其他结果中的 ID；
    - 不要在末尾添加 “参考文献” 或 “来源” 部分，应用程序会呈现来自内联标记的引用；
    - 根据你自己的知识做出的陈述无需任何标记。
  `

  const result = streamText({
    model: mainModel,
    messages: modelMessage,
    system,
    tools: { web_extract, web_search },
    stopWhen: stepCountIs(10),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
