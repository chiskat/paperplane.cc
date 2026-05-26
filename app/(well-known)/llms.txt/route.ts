import { allArticles } from 'content-collections'
import dayjs from 'dayjs'
import type { PhrasingContent, Root } from 'mdast'
import { NextResponse } from 'next/server'
import { remark } from 'remark'

export const dynamic = 'force-static'

const pages = [
  { title: '首页/博客文章列表', url: 'https://paperplane.cc/', description: '博客文章列表' },
  {
    title: 'Awesome',
    url: 'https://paperplane.cc/awesome',
    description: '整理和收藏开发相关的网站、工具与资源',
  },
  {
    title: '开源项目',
    url: 'https://paperplane.cc/open',
    description: '展示 chiskat 维护的开源库、模板与工具',
  },
  {
    title: '项目展示 Demos',
    url: 'https://paperplane.cc/demos',
    description: '展示个人网站、项目案例与技术 Demo',
  },
  {
    title: '源镜像',
    url: 'https://paperplane.cc/registry',
    description: '由 PaperPlane.cc 提供的源镜像和私有制品库',
  },
  {
    title: '短链接',
    url: 'https://paperplane.cc/short',
    description: '创建和管理短链接，由 PaperPlane.cc 实现',
  },
  {
    title: 'OA 机器人',
    url: 'https://paperplane.cc/oa-robot',
    description: '配置并调用钉钉、企业微信、飞书等群机器人消息发送能力',
  },
  {
    title: 'KMS 激活',
    url: 'https://paperplane.cc/kms',
    description: '由 PaperPlane.cc 提供的 Windows 与 Office KMS 激活服务',
  },
  {
    title: 'Work Life Balance',
    url: 'https://paperplane.cc/wlb',
    description: '用于记录通勤、天气、薪资日等与工作生活平衡相关的信息',
  },
  {
    title: '代码片段',
    url: 'https://paperplane.cc/snippet',
    description: '收集命令行、配置文件、前端工程化等常用代码片段',
  },
  {
    title: '关于',
    url: 'https://paperplane.cc/about',
    description: '介绍开发者 chiskat、网站 PaperPlane.cc 及相关技术主页和在线服务',
  },
]

function link(text: string, url: string): PhrasingContent {
  return { type: 'link', url, children: [{ type: 'text', value: text }] }
}

function getArticleItems() {
  return allArticles
    .map(article => {
      const date = dayjs(article.date)

      return {
        title: article.title,
        url: `https://paperplane.cc/post/${article._meta.path
          .split('/')
          .map(part => encodeURIComponent(part))
          .join('/')}`,
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
        depth: 1,
        children: [
          { type: 'text', value: 'PaperPlane.cc - A full-stack personal website by chiskat' },
        ],
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: '此网站 ' },
              link('PaperPlane.cc', 'https://paperplane.cc'),
              { type: 'text', value: ' 是由来自中国的 Web 全栈开发者 ' },
              link('chiskat', 'https://github.com/chiskat'),
              {
                type: 'text',
                value:
                  ' 设计与开发的基于 Next.js 技术的全栈个人网站，用于刊登个人技术博客、实现一些技术 Demo、提供一些在线服务。',
              },
            ],
          },
        ],
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: '页面导航' }],
      },
      {
        type: 'list',
        ordered: false,
        spread: false,
        children: pages.map(page => ({
          type: 'listItem',
          spread: false,
          children: [
            {
              type: 'paragraph',
              children: [
                link(page.title, page.url),
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
              children: [link(article.title, article.url)],
            },
          ],
        })),
      },
    ],
  }

  return remark().data('settings', { bullet: '-' }).stringify(tree)
}

export async function GET() {
  return new NextResponse(getLlmsText(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
