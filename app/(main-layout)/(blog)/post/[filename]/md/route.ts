import { allArticles } from 'content-collections'
import { NextResponse } from 'next/server'

export { generateStaticParams } from '../page'

export async function GET(_request: Request, { params }: RouteContext<'/post/[filename]/md'>) {
  const { filename } = await params
  const article = allArticles.find(item => item._meta.path === filename)

  if (!article) {
    return new NextResponse('Not Found', { status: 404 })
  }

  return new NextResponse(article.content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
