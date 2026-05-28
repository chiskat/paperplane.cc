import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/d/', '/p/', '/s/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}
