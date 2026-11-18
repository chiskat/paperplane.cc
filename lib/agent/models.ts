import { DevToolsTelemetry } from '@ai-sdk/devtools'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { registerTelemetry } from 'ai'

export const mainModelId = 'deepseek-v4.1-flash'

if (process.env.NODE_ENV === 'development') {
  registerTelemetry(DevToolsTelemetry())
}

export const mainModel = createOpenAICompatible({
  name: mainModelId,
  baseURL: process.env.AI_MAIN_MODEL_ENDPOINT!,
  apiKey: process.env.AI_MAIN_MODEL_API_KEY,
})(mainModelId)
