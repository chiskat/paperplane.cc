import 'server-only'

import { streamText } from 'ai'

import { mainModel } from '@/lib/agent/models'

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt: string }
  const result = streamText({ model: mainModel, prompt })

  return result.toTextStreamResponse()
}
