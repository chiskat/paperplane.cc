import { NextResponse } from 'next/server'

import { getFeedXml } from './_feed'

export const dynamic = 'force-static'

export async function GET() {
  return new NextResponse(getFeedXml(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
