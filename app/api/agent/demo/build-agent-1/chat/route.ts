import 'server-only'

import { convertToModelMessages, streamText, type UIMessage } from 'ai'

import { mainModel } from '@/lib/agent/models'

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)
  const result = streamText({ model: mainModel, messages: modelMessage })

  return result.toUIMessageStreamResponse()
}
