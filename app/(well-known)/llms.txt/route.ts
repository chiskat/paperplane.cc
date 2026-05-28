import { allArticles } from 'content-collections'
import dayjs from 'dayjs'
import type { Root } from 'mdast'
import { NextResponse } from 'next/server'
import { remark } from 'remark'

import { getSiteUrl, sitePages } from '@/app/sitemap'

export const dynamic = 'force-static'

const llmsTextIntro = [
  '# PaperPlane.cc - A full-stack personal website by chiskat',
  '',
  '> 此网站 [PaperPlane.cc](https://paperplane.cc) 是由来自中国的 Web 全栈开发者 [chiskat](https://github.com/chiskat) 设计与开发的基于 Next.js 技术的全栈个人网站，用于刊登个人技术博客、实现一些技术 Demo、提供一些在线服务。',
  '',
].join('\n')

function getArticleItems() {
  return allArticles
    .map(article => {
      const date = dayjs(article.date)

      return {
        title: article.title,
        url: getSiteUrl(
          `post/${article._meta.path
            .split('/')
            .map(part => encodeURIComponent(part))
            .join('/')}`
        ),
        timestamp: date.isValid() ? date.valueOf() : 0,
        slug: article._meta.path,
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp || a.slug.localeCompare(b.slug))
}

function getLlmsText() {
  const articles = getArticleItems()

  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: '页面导航' }],
      },
      {
        type: 'list',
        ordered: false,
        spread: false,
        children: sitePages.map(page => ({
          type: 'listItem',
          spread: false,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: getSiteUrl(page.path),
                  children: [{ type: 'text', value: page.title }],
                },
                { type: 'text', value: `：${page.description}` },
              ],
            },
          ],
        })),
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: '博客文章列表' }],
      },
      {
        type: 'list',
        ordered: false,
        spread: false,
        children: articles.map(article => ({
          type: 'listItem',
          spread: false,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: article.url,
                  children: [{ type: 'text', value: article.title }],
                },
              ],
            },
          ],
        })),
      },
    ],
  }

  return `${llmsTextIntro}${remark().data('settings', { bullet: '-' }).stringify(tree)}`
}

export async function GET() {
  return new NextResponse(getLlmsText(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
