import 'server-only'

import { createTextStreamResponse, streamText, toTextStream } from 'ai'

import { mainModel } from '@/lib/agent/models'

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt: string }
  const result = streamText({ model: mainModel, prompt })

  return createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) })
}
