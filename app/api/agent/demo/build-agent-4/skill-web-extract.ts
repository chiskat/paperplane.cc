import { tavily } from '@tavily/core'
import { tool } from 'ai'
import z from 'zod'

const tavilyClient = tavily({ apiKey: process.env.AI_TAVILY_API_KEY })

export const web_extract = tool({
  description:
    '提取一个或多个网页的正文内容。适合在已知 URL 时读取完整页面，或在网络搜索摘要不足时继续获取原文。',
  inputSchema: z.object({
    urls: z.array(z.url()).min(1).max(5).describe('要提取内容的网页 URL，最多 5 个。'),
    query: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('可选。仅提取与该问题相关的内容片段；不传时提取完整正文。'),
    extractDepth: z
      .enum(['basic', 'advanced'])
      .optional()
      .default('basic')
      .describe('提取深度。普通网页用 basic；复杂网页或表格用 advanced。'),
  }),
  execute: async ({ urls, query, extractDepth }) => {
    try {
      const response = await tavilyClient.extract(urls, {
        query,
        extractDepth,
        format: 'markdown',
      })

      return {
        results: response.results.map(result => ({
          title: result.title,
          url: result.url,
          content: result.rawContent,
        })),
        failedResults: response.failedResults,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '网页内容提取失败，请稍后重试。',
      }
    }
  },
})
