import { NextResponse } from 'next/server'

import { getFeedXml } from './feed'

export const dynamic = 'force-static'

export async function GET() {
  return new NextResponse(getFeedXml(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
