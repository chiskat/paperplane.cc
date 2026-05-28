import { allArticles } from 'content-collections'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export interface SitePage {
  path: string
  title: string
  description: string
}

export const defaultSiteUrl = 'https://paperplane.cc'

export const sitePages = [
  { path: '', title: '首页/博客文章列表', description: '博客文章列表' },
  { path: 'awesome', title: 'Awesome', description: '整理和收藏开发相关的网站、工具与资源' },
  { path: 'open', title: '开源项目', description: '展示 chiskat 维护的开源库、模板与工具' },
  { path: 'demos', title: '项目展示 Demos', description: '展示个人网站、项目案例与技术 Demo' },
  { path: 'registry', title: '源镜像', description: '由 PaperPlane.cc 提供的源镜像和私有制品库' },
  { path: 'short', title: '短链接', description: '创建和管理短链接，由 PaperPlane.cc 实现' },
  {
    path: 'oa-robot',
    title: 'OA 机器人',
    description: '配置并调用钉钉、企业微信、飞书等群机器人消息发送能力',
  },
  {
    path: 'kms',
    title: 'KMS 激活',
    description: '由 PaperPlane.cc 提供的 Windows 与 Office KMS 激活服务',
  },
  {
    path: 'wlb',
    title: 'Work Life Balance',
    description: '用于记录通勤、天气、薪资日等与工作生活平衡相关的信息',
  },
  {
    path: 'snippet',
    title: '代码片段',
    description: '收集命令行、配置文件、前端工程化等常用代码片段',
  },
  {
    path: 'about',
    title: '关于',
    description: '介绍开发者 chiskat、网站 PaperPlane.cc 及相关技术主页和在线服务',
  },
] satisfies SitePage[]

export function getSiteUrl(
  path = '',
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL || defaultSiteUrl
) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  return path ? `${normalizedBaseUrl}/${path}` : `${normalizedBaseUrl}/`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = sitePages.map(page => ({
    url: getSiteUrl(page.path),
    changeFrequency: 'monthly',
  }))

  const articles: MetadataRoute.Sitemap = allArticles.map(item => {
    const encodedPath = item._meta.path
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return {
      url: getSiteUrl(`post/${encodedPath}`),
      lastModified: new Date(item.date),
      changeFrequency: 'monthly',
    }
  })

  return [...staticPages, ...articles]
}
