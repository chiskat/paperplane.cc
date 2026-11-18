import { tavily } from '@tavily/core'
import { tool } from 'ai'
import { customAlphabet } from 'nanoid'
import z from 'zod'

const tavilyClient = tavily({ apiKey: process.env.AI_TAVILY_API_KEY })

const createResultId = customAlphabet('0123456789abcdef', 8)

const getFaviconUrl = (favicon: unknown, url: string) => {
  if (typeof favicon === 'string' && favicon) return favicon

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? `${parsedUrl.origin}/favicon.ico`
      : undefined
  } catch {
    return undefined
  }
}

export const web_search = tool({
  description: '从互联网上搜索信息，就像使用 Google 一样。返回包含摘要的搜索结果列表。',
  inputSchema: z.object({
    query: z.string().trim().min(1).describe('要搜索的关键词或问题，尽量简短、明确。'),
    topic: z
      .enum(['general', 'news', 'finance'])
      .optional()
      .describe('搜索主题。一般场景用 general；新闻用 news；财经信息用 finance。'),
    maxResults: z.int().min(1).max(10).optional().default(5).describe('最多返回多少条结果，默认 5'),
  }),
  execute: async ({ query, topic, maxResults }) => {
    try {
      const response = await tavilyClient.search(query, {
        topic,
        maxResults,
        searchDepth: 'advanced',
        includeAnswer: 'advanced',
      })

      return {
        answer: response.answer,
        results: response.results.map(result => ({
          id: createResultId(),
          title: result.title,
          url: result.url,
          content: result.content,
          publishedDate: result.publishedDate,
          favicon: getFaviconUrl(result.favicon, result.url),
        })),
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '网络搜索失败，请稍后重试。' }
    }
  },
})
