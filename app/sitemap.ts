import { allArticles } from 'content-collections'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const staticPaths = [
  '',
  'awesome',
  'open',
  'demos',
  'registry',
  'short',
  'oa-robot',
  'kms',
  'wlb',
  'snippet',
  'about',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = staticPaths.map(path => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${path}`,
    changeFrequency: 'monthly',
  }))

  const articles: MetadataRoute.Sitemap = allArticles.map(item => {
    const encodedPath = item._meta.path
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${encodedPath}`,
      lastModified: new Date(item.date),
      changeFrequency: 'monthly',
    }
  })

  return [...staticPages, ...articles]
}
