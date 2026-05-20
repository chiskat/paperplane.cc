import { allArticles } from 'content-collections'
import dayjs from 'dayjs'
import { NextResponse } from 'next/server'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatLastmod(value: string) {
  const date = dayjs(value)
  return date.isValid() ? date.toISOString() : null
}

export async function GET() {
  const urls = allArticles
    .map(item => {
      const encodedPath = item._meta.path
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/')
      const loc = `${process.env.NEXT_PUBLIC_BASE_URL}/post/${encodedPath}`
      const lastmod = formatLastmod(item.date)
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
      return `  <url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
