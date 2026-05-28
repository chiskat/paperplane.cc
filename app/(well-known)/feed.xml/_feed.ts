import { allArticles } from 'content-collections'
import { Feed } from 'feed'

export const siteUrl = process.env.NEXT_PUBLIC_BASE_URL!
export const canonicalSiteUrl = new URL('/', siteUrl).toString()
export const feedAuthor = { name: 'chiskat', email: '1@paperplane.cc', link: siteUrl }

export function getPostUrl(slug: string) {
  const encodedSlug = slug
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')

  return `${siteUrl}/post/${encodedSlug}`
}

export function getFeedDescription(content: string) {
  return content
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/:::[\s\S]*?:::/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220)
}

export function getSortedArticles() {
  return [...allArticles].sort((a, b) => {
    const timestampDiff = new Date(b.date).valueOf() - new Date(a.date).valueOf()
    return timestampDiff || a._meta.path.localeCompare(b._meta.path)
  })
}

export function createBlogFeed() {
  const sortedArticles = getSortedArticles()
  const latestArticleDate = sortedArticles[0]?.date

  const feed = new Feed({
    id: canonicalSiteUrl,
    title: '纸飞机的信笺 PaperPlane.cc',
    description: 'PaperPlane.cc by chiskat',
    link: siteUrl,
    language: 'zh-CN',
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `Copyright © ${new Date().getFullYear()} chiskat`,
    updated: latestArticleDate ? new Date(latestArticleDate) : new Date(),
    feedLinks: { rss: `${siteUrl}/rss.xml`, atom: `${siteUrl}/atom.xml` },
    author: feedAuthor,
  })

  for (const article of sortedArticles) {
    const url = getPostUrl(article._meta.path)
    const date = new Date(article.date)

    feed.addItem({
      title: article.title,
      id: url,
      link: url,
      date,
      published: date,
      description: getFeedDescription(article.content),
      author: [feedAuthor],
      category: [...article.categories, ...article.tags].map(name => ({ name, term: name })),
    })
  }

  return feed
}

export function getRssXml() {
  return createBlogFeed().rss2()
}

export function getAtomXml() {
  return createBlogFeed().atom1()
}

export function getFeedXml() {
  return getRssXml()
}
