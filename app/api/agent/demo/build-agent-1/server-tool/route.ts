import 'server-only'

import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'

import { mainModel } from '@/lib/agent/models'

import 'dayjs/locale/zh-cn'

dayjs.extend(utc)
dayjs.locale('zh-cn')

const getCurrentTimeByTimeZone = tool({
  description: '获取指定时区的当前时间。',
  inputSchema: z.object({
    timeZone: z
      .int()
      .min(-12)
      .max(14)
      .optional()
      .default(8)
      .describe('UTC 时区偏移小时数，仅支持数字，例如 8、-8、0；不提供时默认为 8。'),
  }),
  execute: async ({ timeZone }) => {
    return { formatted: dayjs().utcOffset(timeZone).format('YYYY年M月D日 dddd HH:mm:ss') }
  },
})

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  const result = streamText({
    model: mainModel,
    messages: modelMessage,
    tools: { getCurrentTimeByTimeZone },
  })

  return result.toUIMessageStreamResponse()
}
