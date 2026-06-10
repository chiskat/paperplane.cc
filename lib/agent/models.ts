import { devToolsMiddleware } from '@ai-sdk/devtools'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { wrapLanguageModel } from 'ai'

export const mainModelId = 'GLM-5.1'

const rawMainModel = createOpenAICompatible({
  name: mainModelId,
  baseURL: process.env.AI_MAIN_MODEL_ENDPOINT!,
  apiKey: process.env.AI_MAIN_MODEL_API_KEY,
})(mainModelId)

export const mainModel =
  process.env.NODE_ENV === 'development'
    ? wrapLanguageModel({ model: rawMainModel, middleware: devToolsMiddleware() })
    : rawMainModel
